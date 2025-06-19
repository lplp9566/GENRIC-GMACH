import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("regulation")
export class RegulationEntity {
     @PrimaryGeneratedColumn()
     id: number

     @Column({type: 'text'})
     regulation: string

}