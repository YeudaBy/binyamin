import {Entity, Fields, IdEntity, Relations} from "remult";
import {Tractate} from "@/shared/Entities/Tractate";
import {User} from "@/shared/Entities/User";

export enum PageStatus {
    Available,
    Drafted,
    Taken,
    Completed
}

@Entity("page", {
    allowApiCrud: true
})
export class Page extends IdEntity {

    @Fields.enum(() => PageStatus)
    pageStatus = PageStatus.Available

    @Relations.toOne(() => User)
    byUser: User | undefined = undefined

    @Fields.date()
    takenAt: Date | undefined

    @Relations.toOne(() => Tractate)
    tractate!: Tractate

    @Fields.number()
    index!: number

    @Fields.string()
    indexName!: string
}
