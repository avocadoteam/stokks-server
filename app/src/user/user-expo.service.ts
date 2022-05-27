import { UserExpoSettingsInstallModel, UserExpoSettingsPatchModel } from '@models';

import { Connection } from 'typeorm';
import { ExpoSettings } from 'src/db/client/tables/ExpoSettings';
import { Injectable } from '@nestjs/common';
import { UserAccount } from 'src/db/client/tables/UserAccount';
import { autoRetryTransaction } from 'src/db/utils/transactions';

@Injectable()
export class UserExpoService {
  constructor(private readonly connection: Connection) {}

  async installNotification(userId: number, { token, device }: UserExpoSettingsInstallModel) {
    await autoRetryTransaction(this.connection, async qr => {
      const expoSetting = await qr.manager.findOneBy(ExpoSettings, { user: { id: userId }, device });
      if (expoSetting) {
        expoSetting.token = token as any;
        await qr.manager.save(expoSetting);
      } else {
        const newExpo = new ExpoSettings();

        newExpo.token = token as any;
        newExpo.user = userId as unknown as UserAccount;
        newExpo.device = device;
        newExpo.enableNotification = true;

        await qr.manager.save(newExpo);
      }

      await qr.commitTransaction();
    });
  }
  async patchExpoNotification(userId: number, { enable, device }: UserExpoSettingsPatchModel) {
    await autoRetryTransaction(this.connection, async qr => {
      const expoSettings = await qr.manager.findBy(ExpoSettings, { user: { id: userId }, device });
      for (const expoSetting of expoSettings) {
        expoSetting.enableNotification = enable;
        await qr.manager.save(expoSetting);
      }

      await qr.commitTransaction();
    });
  }
}
