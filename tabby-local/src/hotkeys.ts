import { Injectable } from '@angular/core'
import { HotkeyDescription, HotkeyProvider, ProfilesService } from 'tabby-core'

/** @hidden */
@Injectable()
export class LocalTerminalHotkeyProvider extends HotkeyProvider {
    hotkeys: HotkeyDescription[] = [
        {
            id: 'new-tab',
            name: 'New tab',
        },
    ]

    constructor (
        private profilesService: ProfilesService,
    ) { super() }

    async provide (): Promise<HotkeyDescription[]> {
        const profiles = await this.profilesService.getProfiles()
        return [
            ...this.hotkeys,
            ...profiles.map(profile => ({
                id: `profile.${profile.id}`,
                name: `New tab: ${profile.name}`,
            })),
        ]
    }
}
