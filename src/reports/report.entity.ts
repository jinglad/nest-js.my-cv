import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Report {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  price: number;
  // make: string;
  // model: string;
  // year: number;
  // lng: number;
  // lat: number;
  // mileage: number;
}
