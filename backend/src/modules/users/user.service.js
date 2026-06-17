import bcrypt from 'bcryptjs';
import { AppError } from '../../utils/errors.js';
import { AuthorizationService } from '../../services/authorization.service.js';
import { RefreshTokenService } from '../auth/refresh-token.service.js';

const refreshTokenService = new RefreshTokenService();

class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async register(data) {
    const emailExists = await this.userRepository.emailExists(data.email);
    if (emailExists) {
      throw new AppError('Email já cadastrado', 400);
    }

    const raExists = await this.userRepository.raExists(data.ra);
    if (raExists) {
      throw new AppError('RA já cadastrado', 400);
    }

    const hashedPassword = await bcrypt.hash(data.senha, 10);

    // gestorId não vai para a tabela User
    const { gestorId, ...userData } = data;

    const user = await this.userRepository.create({
      ...userData,
      senha: hashedPassword
    });

    if (userData.tipo === 'colaborador' && gestorId) {
      await this.userRepository.addGestorColaborador(gestorId, user.id);
    }

    // O repository.create retorna todos os campos do modelo (sem select).
    // Removemos a senha explicitamente aqui pois create() não usa userSelect.
    delete user.senha;

    return user;
  }

  async login(email, senha) {
    // findByEmailWithPassword inclui a senha — único método que deve fazê-lo
    const user = await this.userRepository.findByEmailWithPassword(email);

    // Resposta genérica para não revelar se o email existe
    if (!user || user.deletedAt) {
      throw new AppError('Email ou senha inválidos', 401);
    }

    const isPasswordValid = await bcrypt.compare(senha, user.senha);
    if (!isPasswordValid) {
      throw new AppError('Email ou senha inválidos', 401);
    }

    const tokens = await refreshTokenService.createTokenPair(user);

    // Remove senha antes de retornar (findByEmailWithPassword inclui o campo)
    delete user.senha;

    return { user, ...tokens };
  }

  async getProfile(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }
    // findById usa o BaseRepository que não tem select — remove senha por segurança
    delete user.senha;
    return user;
  }

  async updateProfile(userId, data) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    if (data.foto) {
      const base64Regex = /^data:image\/(png|jpg|jpeg|gif|webp);base64,/;
      if (!base64Regex.test(data.foto)) {
        throw new AppError('Formato de imagem inválido. Use PNG, JPG, GIF ou WebP.', 400);
      }

      const base64Length = data.foto.length - (data.foto.indexOf(',') + 1);
      const sizeInMB = (base64Length * 3) / 4 / (1024 * 1024);
      if (sizeInMB > 2) {
        throw new AppError('Imagem muito grande. Máximo 2MB.', 400);
      }
    }

    // repository.update usa userSelect — senha não é retornada
    return this.userRepository.update(userId, data);
  }

  async findAll(filters, userTipo) {
    // Colaborador vê apenas gestores ativos
    if (userTipo === 'colaborador') {
      filters.tipo = 'gestor';
    }

    // Gestor não vê admins — passa lista explícita de tipos permitidos
    if (userTipo === 'gestor' && !filters.tipo) {
      filters.tipoIn = ['gestor', 'colaborador'];
    }

    return this.userRepository.findAll(filters);
  }

  async findById(id, requestUserId, requestUserTipo) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    AuthorizationService.requireOwnerOrAdmin(id, requestUserId, requestUserTipo);

    // findById usa BaseRepository sem select — remove senha por segurança
    delete user.senha;
    return user;
  }

  async findByRA(ra) {
    const user = await this.userRepository.findByRA(ra);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }
    // findByRA usa userSelect — senha não é retornada, delete é desnecessário mas inofensivo
    return user;
  }

  async delete(id) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    if (user.tipo === 'admin') {
      throw new AppError('Não é possível deletar admin', 400);
    }

    await this.userRepository.softDelete(id);
    await refreshTokenService.logoutAll(id);

    return { message: 'Usuário desativado com sucesso' };
  }

  /**
   * Retorna lista de departamentos distintos dos usuários ativos,
   * ordenados alfabeticamente. Sem tabela extra — usa os dados já existentes.
   */
  async getDepartamentos() {
    return this.userRepository.findDepartamentosDistintos();
  }
}

export { UserService };
