import { v4 as uuidv4 } from 'uuid'
import slugify from 'slugify'
import deepClone from 'clone-deep'
import { Component } from '@angular/core'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { ConfigService, HostAppService, Profile, SelectorService, ProfilesService } from 'tabby-core'
import { EditProfileModalComponent } from './editProfileModal.component'

/** @hidden */
@Component({
    template: require('./profilesSettingsTab.component.pug'),
})
export class ProfilesSettingsTabComponent {
    profiles: Profile[] = []

    constructor (
        public config: ConfigService,
        public hostApp: HostAppService,
        private profilesService: ProfilesService,
        private selector: SelectorService,
        private ngbModal: NgbModal,
    ) { }

    async ngOnInit (): Promise<void> {
        this.profiles = await this.profilesService.getProfiles()
    }

    async newProfile (): Promise<void> {
        const base = await this.selector.show('Select the profile to use as a template', this.profiles.map(p => ({
            icon: p.icon,
            name: p.name,
            result: p,
        })))
        const profile = deepClone(base)
        profile.id = null
        await this.editProfile(profile)
        profile.id = `${profile.type}:custom:${slugify(profile.name)}:${uuidv4()}`
        this.config.store.profiles = [profile, ...this.config.store.profiles]
        this.config.save()
    }

    editProfile (profile: Profile): Promise<void> {
        const modal = this.ngbModal.open(EditProfileModalComponent)
        modal.componentInstance.profile = Object.assign({}, profile)
        return modal.result.then(result => {
            Object.assign(profile, result)
            this.config.save()
        })
    }

    deleteProfile (profile: Profile): void {
        this.config.store.profiles = this.config.store.profiles.filter(x => x !== profile)
        this.config.save()
    }
}
