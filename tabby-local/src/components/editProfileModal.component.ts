/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Observable, OperatorFunction } from 'rxjs'
import { debounceTime, map } from 'rxjs/operators'
import { Component } from '@angular/core'
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap'
import { UACService } from '../services/uac.service'
import { LocalProfile } from '../api'
import { ElectronHostWindow, ElectronService } from 'tabby-electron'

const iconsData = require('../../../tabby-core/src/icons.json')
const iconsClassList = Object.keys(iconsData).map(
    icon => iconsData[icon].map(
        style => `fa${style[0]} fa-${icon}`
    )
).flat()

/** @hidden */
@Component({
    template: require('./editProfileModal.component.pug'),
})
export class EditProfileModalComponent {
    profile: LocalProfile

    constructor (
        public uac: UACService,
        private hostWindow: ElectronHostWindow,
        private electron: ElectronService,
        private modalInstance: NgbActiveModal,
    ) {

    }

    ngOnInit () {
        this.profile.options.env = this.profile.options.env ?? {}
        this.profile.options.args = this.profile.options.args ?? []
    }

    iconSearch: OperatorFunction<string, string[]> = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(200),
            map(term => term === '' ? []
                : iconsClassList.filter(v => v.toLowerCase().includes(term.toLowerCase())).slice(0, 10)
            )
        )

    async pickWorkingDirectory (): Promise<void> {
        // const profile = await this.terminal.getProfileByID(this.config.store.terminal.profile)
        // const shell = this.shells.find(x => x.id === profile?.shell)
        // if (!shell) {
        //     return
        // }
        const paths = (await this.electron.dialog.showOpenDialog(
            this.hostWindow.getWindow(),
            {
                // TODO
                // defaultPath: shell.fsBase,
                properties: ['openDirectory', 'showHiddenFiles'],
            }
        )).filePaths
        this.profile.options.cwd = paths[0]
    }

    save () {
        this.modalInstance.close(this.profile)
    }

    cancel () {
        this.modalInstance.dismiss()
    }

    trackByIndex (index) {
        return index
    }
}
