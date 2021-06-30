/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Injectable } from '@angular/core'
import { ToolbarButtonProvider, ToolbarButton, SelectorOption, SelectorService, AppService, ProfilesService } from 'tabby-core'
import { ElectronService } from 'tabby-electron'
import { SettingsTabComponent } from 'tabby-settings'

import { TerminalService } from './services/terminal.service'

/** @hidden */
@Injectable()
export class ButtonProvider extends ToolbarButtonProvider {
    constructor (
        electron: ElectronService,
        private selector: SelectorService,
        private terminal: TerminalService,
        private app: AppService,
        private profilesServices: ProfilesService,
    ) {
        super()
    }

    async activate () {
        const options: SelectorOption<void>[] = []
        const profiles = await this.profilesServices.getProfiles()

        for (const profile of profiles) {
            options.push({
                icon: profile.icon,
                name: profile.name,
                callback: () => this.profilesServices.openNewTabForProfile(profile),
            })
        }

        options.push({
            name: 'Manage profiles',
            icon: 'fas fa-window-restore',
            callback: () => this.app.openNewTabRaw({
                type: SettingsTabComponent,
                inputs: { activeTab: 'profiles' },
            }),
        })

        await this.selector.show('Select profile', options)
    }

    provide (): ToolbarButton[] {
        return [
            {
                icon: require('./icons/plus.svg'),
                title: 'New terminal',
                touchBarNSImage: 'NSTouchBarAddDetailTemplate',
                click: () => {
                    this.terminal.openTab()
                },
            },
            {
                icon: require('./icons/profiles.svg'),
                title: 'New terminal with profile',
                click: () => this.activate(),
            },
        ]
    }
}
