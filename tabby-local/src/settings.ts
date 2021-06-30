import { Injectable } from '@angular/core'
import { SettingsTabProvider } from 'tabby-settings'

import { ProfilesSettingsTabComponent } from './components/profilesSettingsTab.component'
import { ShellSettingsTabComponent } from './components/shellSettingsTab.component'

/** @hidden */
@Injectable()
export class ShellSettingsTabProvider extends SettingsTabProvider {
    id = 'terminal-shell'
    icon = 'list-ul'
    title = 'Shell'

    getComponentType (): any {
        return ShellSettingsTabComponent
    }
}

/** @hidden */
@Injectable()
export class ProfilesSettingsTabProvider extends SettingsTabProvider {
    id = 'profiles'
    icon = 'window-restore'
    title = 'Profiles'

    getComponentType (): any {
        return ProfilesSettingsTabComponent
    }
}
