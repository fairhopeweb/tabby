import { BaseTabComponent } from '../components/baseTab.component'
import { NewTabParameters } from '../services/tabs.service'

export interface Profile {
    id?: string
    type: string
    name: string
    group?: string
    options?: Record<string, any>

    isBuiltin?: boolean
    icon?: string
    color?: string
    disableDynamicTitle?: boolean
}

export abstract class ProfileProvider {
    id: string
    name: string
    weight = 0

    abstract getBuiltinProfiles (): Promise<Profile[]>

    abstract getNewTabParameters (profile: Profile): Promise<NewTabParameters<BaseTabComponent>>
}
