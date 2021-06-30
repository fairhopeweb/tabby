import { Injectable, Inject } from '@angular/core'
import { NewTabParameters } from './tabs.service'
import { BaseTabComponent } from '../components/baseTab.component'
import { Profile, ProfileProvider } from '../api/profileProvider'
import { AppService } from './app.service'
import { ConfigService } from './config.service'

@Injectable({ providedIn: 'root' })
export class ProfilesService {
    constructor (
        private app: AppService,
        private config: ConfigService,
        @Inject(ProfileProvider) private profileProviders: ProfileProvider[],
    ) { }

    async openNewTabForProfile (profile: Profile): Promise<BaseTabComponent|null> {
        const params = await this.newTabParametersForProfile(profile)
        if (params) {
            const tab = this.app.openNewTab(params)
            ;(this.app.getParentTab(tab) ?? tab).color = profile.color ?? null
            if (profile.disableDynamicTitle) {
                tab['enableDynamicTitle'] = false
                tab.setTitle(profile.name)
            }
            return tab
        }
        return null
    }

    async newTabParametersForProfile (profile: Profile): Promise<NewTabParameters<BaseTabComponent>|null> {
        const provider = this.profileProviders.find(x => x.id === profile.type)
        return provider?.getNewTabParameters(profile) ?? null
    }

    async getProfiles (): Promise<Profile[]> {
        this.profileProviders.sort((a, b) => a.weight - b.weight)
        const lists = await Promise.all(this.config.enabledServices(this.profileProviders).map(x => x.getBuiltinProfiles()))
        let list = lists.reduce((a, b) => a.concat(b), [])
        list = [
            ...this.config.store.profiles ?? [],
            ...list,
        ]
        return list
    }
}
