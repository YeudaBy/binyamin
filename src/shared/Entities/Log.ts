import {Entity, Fields, IdEntity} from "remult";

@Entity("log", {allowApiRead: true})
export class Log extends IdEntity {
    @Fields.string()
    text!: string

    @Fields.createdAt()
    createdAt!: Date

    @Fields.boolean()
    show = true
}
