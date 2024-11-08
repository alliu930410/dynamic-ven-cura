import { Test } from '@nestjs/testing';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CustodialModule } from './custodial.module';
import { PrismaService } from 'src/prisma/prisma.service';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { AppModule } from 'src/app.module';

describe('CustodialController', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    prismaService = app.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    // Cleanup database after each test
  });

  it('should return 401 Unauthorized error if accessToken is missing', async () => {
    const res = await request(app.getHttpServer())
      .get(`/custodial/wallets`)
      .expect(401);

    expect(res.body).toMatchInlineSnapshot(`
{
  "message": "Unauthorized",
  "statusCode": 401,
}
`);
  });
});
