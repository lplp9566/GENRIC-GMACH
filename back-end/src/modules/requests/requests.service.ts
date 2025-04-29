import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/modules/users/users.service';
import { RequestEntity } from './entities/request.entity';
import { Repository } from 'typeorm';
import { IRequest, RequestStatus } from './dto/request.dto';
@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(RequestEntity)
    private readonly requestsRepo: Repository<RequestEntity>,
    private readonly usersService: UsersService,
    
  ) {}

  async createRequest(requestData: IRequest) {
    try {
      const user = await this.usersService.getUserById(Number(requestData.userId));
      if (!user) {
        throw new Error('User not found');
      }
      const request=   this.requestsRepo.create(requestData);
      request.requestDate = new Date();
      request.status = RequestStatus.PENDING;
      request.user = user;
      return this.requestsRepo.save(request);
    } catch (error) {
      console.error('Error creating request:', error);
  throw new BadRequestException(error.message);
    }
  }
  async editStatus(id: number, status: RequestStatus) { 
    try {
      const request = await this.requestsRepo.findOne({ where: { id } });
      if (!request) {
        throw new Error('Request not found');
      }
      request.status = status;
      return this.requestsRepo.save(request);
    } catch (error) {
      console.error('Error updating request status:', error);
      throw new BadRequestException(error.message);
    }
  
  }
}
