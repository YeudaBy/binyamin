import {Entity, Fields, IdEntity, Relations, repo} from "remult";
import {Tractate} from "@/shared/Entities/Tractate";
import {Log} from "@/shared/Entities/Log";

export enum PageStatus {
    Available,
    Taken,
    Completed
}

@Entity<Page>("page", {
    allowApiCrud: true,
    saved: async (entity, e) => {
        if (entity.isNew()) return 
        if (e.fields.byUser.valueChanged()) {
            console.log(entity.byUser)
            const lRepo = repo(Log)
            const full = await e.repository.findId(entity.id, {include: {tractate: true}})
            const log = await lRepo.insert({
                text: `${entity.byUserName} קיבל על עצמו לימוד של דף ${entity.indexName} ממסכת ${full?.tractate.name}!`
            })
            console.log(log.text)
        }
    }
})
export class Page extends IdEntity {

    @Fields.enum(() => PageStatus)
    pageStatus = PageStatus.Available

    @Fields.string()
    byUser: string | undefined

    @Fields.string()
    byUserName: string | undefined

    @Fields.date()
    takenAt: Date | undefined

    @Relations.toOne(() => Tractate)
    tractate!: Tractate

    @Fields.number()
    index!: number

    @Fields.string()
    indexName!: string
}
