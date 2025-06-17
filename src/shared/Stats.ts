import { BackendMethod, remult } from 'remult';
import { Page, PageStatus } from './Entities/Page';

export class StatsController {
  @BackendMethod({ allowed: true })
  static async getPageStats() {
    const pRepo = remult.repo(Page);

    // Fetch all counts in parallel for better performance
    const [completed, taken, total] = await Promise.all([
      pRepo.count({ pageStatus: PageStatus.Completed }),
      pRepo.count({ pageStatus: PageStatus.Taken }),
      pRepo.count(),
    ]);

    return { completed, taken, total };
  }
} 