import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MonthlyRatesEntity } from './monthly_rates.entity';

@Injectable()
export class MonthlyRatesService {
  constructor(
    @InjectRepository(MonthlyRatesEntity)
    private monthlyRatesRepository: Repository<MonthlyRatesEntity>,
  ) {}


  //קבלת כל הנתוים  לפי דרגה 
  async getRatesForRole(role: string): Promise<MonthlyRatesEntity[]> {
    return this.monthlyRatesRepository
      .createQueryBuilder("rate")
      .where("rate.role = :role", { role })
      .orderBy("rate.year", "ASC")
      .addOrderBy("rate.month", "ASC")
      .getMany();
  }
//הוספת שורה בטבלה 
  async addRate(rate: MonthlyRatesEntity): Promise<MonthlyRatesEntity> {
    try {
      const OldRate = await this.monthlyRatesRepository.findOne({
        where: {
          year: rate.year,
          month: rate.month,
          role: rate.role
        },
      });
      if(OldRate) throw new Error('Rate already exist') 
      
      const newRate = this.monthlyRatesRepository.create(rate);
      return this.monthlyRatesRepository.save(newRate);
    }
     catch (error) {
      return error.message;
    }
  }
  //קבלת כל השורות 
  async getAllRates(): Promise<MonthlyRatesEntity[]> {
    try {
      const allRates = this.monthlyRatesRepository.find() 
      if(!allRates){
        throw new Error('no rates fund')
      }
      return allRates
    } catch (error) {
      return error.message
    }
  } 
  }

