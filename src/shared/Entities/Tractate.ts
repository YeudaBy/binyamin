import {Entity, Fields, IdEntity} from "remult";

export enum Seder {
    Zraim = "זרעים",
    Moed = "מועד",
    Nashim = "נשים",
    Nezikin = "נזיקין",
    Kodshim = "קדשים",
    Taharot = "טהרות"
}

@Entity("tractate")
export class Tractate extends IdEntity {

    @Fields.string()
    name!: string

    @Fields.enum(() => Seder)
    seder!: Seder

}
