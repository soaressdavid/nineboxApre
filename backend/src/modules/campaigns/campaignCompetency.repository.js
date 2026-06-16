import { prisma } from '../../config/database.js';
import { BaseRepository } from '../../repositories/base.repository.js';

class CampaignCompetencyRepository extends BaseRepository {
  constructor() {
    super(prisma.campaignCompetency);
  }

  async findByCampaignId(campaignId) {
    return await prisma.campaignCompetency.findMany({
      where: { campaignId },
      include: {
        competency: true
      }
    });
  }

  async deleteByCampaignId(campaignId) {
    return await prisma.campaignCompetency.deleteMany({
      where: { campaignId }
    });
  }
}

export { CampaignCompetencyRepository };
