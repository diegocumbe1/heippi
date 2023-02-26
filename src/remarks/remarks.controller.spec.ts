import { Test, TestingModule } from '@nestjs/testing';
import { RemarksController } from './remarks.controller';

describe('RemarksController', () => {
  let controller: RemarksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RemarksController],
    }).compile();

    controller = module.get<RemarksController>(RemarksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
