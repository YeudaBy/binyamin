import {Entity, Fields, IdEntity} from "remult";

@Entity("user")
export class User extends IdEntity {

    @Fields.string()
    name!: string

    @Fields.string()
    email!: string
}
