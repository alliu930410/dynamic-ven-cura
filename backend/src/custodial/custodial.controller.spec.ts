import { Test } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import * as jwt from 'jsonwebtoken';
import { ethers, isAddress } from 'ethers';
import { Alchemy, BigNumber } from 'alchemy-sdk';
import { polygon, sepolia } from 'viem/chains';
import { EVMService } from 'src/evm/evm.service';

// Mock Alchemy SDK
jest.mock('alchemy-sdk');
const alchemyClient: any = {};
Alchemy['mockImplementation'](() => alchemyClient);

// Helper function to generate jwt token with the given payload
const generateJwtToken = (payload: any): string => {
  return jwt.sign(payload, process.env.DYNAMIC_PRIVATE_KEY, {
    algorithm: 'RS256',
  });
};

describe('CustodialController', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let evmService: EVMService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    prismaService = app.get<PrismaService>(PrismaService);
    evmService = app.get<EVMService>(EVMService);
  });

  afterEach(async () => {
    // Cleanup database after each test
    await prismaService.messageHistory.deleteMany();
    await prismaService.transactionHistory.deleteMany();
    await prismaService.custodialWallet.deleteMany();
    await prismaService.user.deleteMany();
  });

  describe('GET /custodial/wallets', () => {
    it('should return 401 Unauthorized error if jwt token is missing', async () => {
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

    it('should return empty array if user has no custodial wallets', async () => {
      // Prep: generate a token that resolves to a user with no custodial wallets
      const token = generateJwtToken({
        sub: 'user-with-no-custodial-wallets',
      });

      const res = await request(app.getHttpServer())
        .get(`/custodial/wallets`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toMatchInlineSnapshot(`[]`);
    });

    it('should return list of wallets if user has custodial wallets by ascending creation order', async () => {
      // Prep: generate a token that resolves to a user with no custodial wallets
      const token = generateJwtToken({
        sub: 'user-with-custodial-wallets',
      });

      // Prep: create user with 2 custodial wallets
      await prismaService.user.create({
        data: {
          dynamicUserId: 'user-with-custodial-wallets',
          custodialWallets: {
            create: [
              {
                address: '0x123',
                nickName: 'Account 1',
                privateKey: 'test_private_key_1',
                privateKeyIV: 'test_string_iv_1',
                publicKey: 'test_public_key_1',
                createdAt: new Date('2024-11-08T00:00:00.000Z'),
              },
              {
                address: '0x456',
                privateKey: 'test_private_key_2',
                privateKeyIV: 'test_string_iv_2',
                publicKey: 'test_public_key_2',
                createdAt: new Date('2024-11-07T00:00:00.000Z'),
              },
            ],
          },
        },
      });

      const res = await request(app.getHttpServer())
        .get(`/custodial/wallets`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toMatchInlineSnapshot(`
[
  {
    "address": "0x456",
    "createdAt": "2024-11-07T00:00:00.000Z",
    "nickName": null,
    "publicKey": "test_public_key_2",
  },
  {
    "address": "0x123",
    "createdAt": "2024-11-08T00:00:00.000Z",
    "nickName": "Account 1",
    "publicKey": "test_public_key_1",
  },
]
`);
    });
  });

  describe('POST /custodial/wallet', () => {
    it('should return 401 Unauthorized error if jwt token is missing', async () => {
      const res = await request(app.getHttpServer())
        .post(`/custodial/wallet`)
        .expect(401);

      expect(res.body).toMatchInlineSnapshot(`
{
  "message": "Unauthorized",
  "statusCode": 401,
}
`);
    });

    it("should create a new user and associate the custodial wallet (if user doesn't already exist)", async () => {
      const mockDynamicUserId = 'new-user';

      // Prep: generate a token that resolves to a user with no custodial wallets
      const token = generateJwtToken({
        sub: mockDynamicUserId,
      });

      // Sanity check: user shall not exist in the database
      const userBefore = await prismaService.user.findFirst({
        where: {
          dynamicUserId: mockDynamicUserId,
        },
      });
      expect(userBefore).toBeNull();

      const res = await request(app.getHttpServer())
        .post(`/custodial/wallet`)
        .set('Authorization', `Bearer ${token}`)
        .expect(201);

      const { address, nickName, publicKey } = res.body;
      expect(isAddress(address)).toBe(true);
      expect(nickName).toBe('Account 1');
      expect(publicKey).toBeDefined();

      // Sanity check: user shall be created and have 1 custodial wallet
      const userAfter = await prismaService.user.findFirst({
        where: {
          dynamicUserId: mockDynamicUserId,
        },
        include: {
          custodialWallets: true,
        },
      });

      expect(userAfter).toBeDefined();
      expect(userAfter.custodialWallets).toHaveLength(1);
    });

    it('should just associate the custodial wallet to an existing user (if user exists)', async () => {
      const mockDynamicUserId = 'existing-user';

      // Prep: create user with no custodial wallets
      await prismaService.user.create({
        data: {
          dynamicUserId: mockDynamicUserId,
        },
      });

      // Prep: generate a token that resolves to a user with no custodial wallets
      const token = generateJwtToken({
        sub: mockDynamicUserId,
      });

      // Sanity check: user shall not exist in the database
      const userBefore = await prismaService.user.findFirst({
        where: {
          dynamicUserId: mockDynamicUserId,
        },
        include: {
          custodialWallets: true,
        },
      });
      expect(userBefore).toBeDefined();
      expect(userBefore.custodialWallets).toHaveLength(0);

      const res = await request(app.getHttpServer())
        .post(`/custodial/wallet`)
        .set('Authorization', `Bearer ${token}`)
        .expect(201);

      const { address, nickName, publicKey } = res.body;
      expect(isAddress(address)).toBe(true);
      expect(nickName).toBe('Account 1');
      expect(publicKey).toBeDefined();

      // Sanity check: user shall be created and have 1 custodial wallet
      const userAfter = await prismaService.user.findFirst({
        where: {
          dynamicUserId: mockDynamicUserId,
        },
        include: {
          custodialWallets: true,
        },
      });

      expect(userAfter).toBeDefined();
      expect(userAfter.custodialWallets).toHaveLength(1);
    });
  });

  describe('GET /custodial/wallet/balance/:chainId/:address', () => {
    const mockWalletAddress = '0x0000000000000000000000000000000000000000';

    it('should return 400 Bad Request error if chain id is not supported yet', async () => {
      const res = await request(app.getHttpServer())
        .get(`/custodial/wallet/balance/${polygon.id}/${mockWalletAddress}`)
        .expect(400);

      expect(res.body).toMatchInlineSnapshot(`
{
  "error": "Invalid chain ID",
  "message": "Chain ID 137 is not supported",
}
`);
    });

    it('should return 200 OK with balance if chain id is supported (wallet has balance)', async () => {
      // Prep: mock Alchemy client to return BigNumber balance of 1 ETH
      const mockBalance = ethers.parseEther('1.0'); // 1 ETH in wei
      alchemyClient.core = {
        // Note: the payload is from Base Sepolia (chainId 84532) for contract `0xdD6268182666eb07929b5BBD8f1f43c65532AcC0`
        getBalance: jest.fn().mockResolvedValue(mockBalance),
      };

      const res = await request(app.getHttpServer())
        .get(`/custodial/wallet/balance/${sepolia.id}/${mockWalletAddress}`)
        .expect(200);

      expect(res.body).toMatchInlineSnapshot(`
{
  "address": "0x0000000000000000000000000000000000000000",
  "balance": "1.0",
}
`);
    });

    it('should return 200 OK with balance if chain id is supported (wallet does not have balance)', async () => {
      // Prep: mock Alchemy client to return BigNumber balance of 0
      const mockBalance = ethers.parseEther('0.0');
      alchemyClient.core = {
        // Note: the payload is from Base Sepolia (chainId 84532) for contract `0xdD6268182666eb07929b5BBD8f1f43c65532AcC0`
        getBalance: jest.fn().mockResolvedValue(mockBalance),
      };

      const res = await request(app.getHttpServer())
        .get(`/custodial/wallet/balance/${sepolia.id}/${mockWalletAddress}`)
        .expect(200);

      expect(res.body).toMatchInlineSnapshot(`
{
  "address": "0x0000000000000000000000000000000000000000",
  "balance": "0.0",
}
`);
    });
  });

  describe('POST /custodial/wallet/signMessage', () => {
    it('should return 401 Unauthorized error if jwt token is missing', async () => {
      const res = await request(app.getHttpServer())
        .post(`/custodial/wallet/signMessage`)
        .expect(401);

      expect(res.body).toMatchInlineSnapshot(`
{
  "message": "Unauthorized",
  "statusCode": 401,
}
`);
    });

    it("should return 404 Not Found error if wallet doesn't exist", async () => {
      // Prep: generate a token that resolves to a user with no custodial wallets
      const token = generateJwtToken({
        sub: 'user-with-no-custodial-wallets',
      });

      const res = await request(app.getHttpServer())
        .post(`/custodial/wallet/signMessage`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          address: '0x123',
          message: 'test_message',
        })
        .expect(404);

      expect(res.body).toMatchInlineSnapshot(`
{
  "error": "Wallet not found",
  "message": "Wallet with address 0x123 not found",
}
`);
    });

    it('should return 201 Created with signed message if wallet exists', async () => {
      // Prep: mock jwt token to resolve to the user with the custodial wallet
      const mockDynamicUserId = 'user-with-custodial-wallet';
      const token = generateJwtToken({
        sub: mockDynamicUserId,
      });

      // Prep: create the user with a custodial wallet in db
      const resWalletCreation = await request(app.getHttpServer())
        .post(`/custodial/wallet`)
        .set('Authorization', `Bearer ${token}`)
        .expect(201);
      const { address } = resWalletCreation.body;

      const testMessage = '0x12345abcde';
      const res = await request(app.getHttpServer())
        .post(`/custodial/wallet/signMessage`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          address,
          message: testMessage,
        })
        .expect(201);

      expect(res.body).toHaveProperty('message', testMessage);
      expect(res.body).toHaveProperty('address', address);
      expect(res.body.signature).toBeDefined();

      // Sanity check: A message history shall be created in the database, the signed message shall be encoded and stored
      const messageHistories = await prismaService.messageHistory.findMany({
        where: {
          custodialWallet: {
            address,
          },
        },
      });

      expect(messageHistories).toHaveLength(1);
      expect(messageHistories[0].signature === testMessage).toBe(false);
      expect(messageHistories[0].signatureIV).toBeDefined();
    });
  });

  describe('POST /custodial/wallet/sendTransaction', () => {
    let mockDynamicUserId: string = 'existing-user';
    let mockCustodialWalletAddress: string;
    let token: string;

    beforeEach(async () => {
      // Mock evmService.sendTransaction to return a valid transaction response
      jest.spyOn(evmService, 'sendTransaction').mockResolvedValue({
        transactionHash: '0xTRANSACTION',
        nonce: 1,
      });

      // Prep: generate a token that resolves to a user with a custodial wallet
      token = generateJwtToken({
        sub: mockDynamicUserId,
      });

      // Prep: create the user with a custodial wallet in db
      const resWalletCreation = await request(app.getHttpServer())
        .post(`/custodial/wallet`)
        .set('Authorization', `Bearer ${token}`)
        .expect(201);
      mockCustodialWalletAddress = resWalletCreation.body.address;
    });

    it('should return 401 Unauthorized error if jwt token is missing', async () => {
      const res = await request(app.getHttpServer())
        .post(`/custodial/wallet/sendTransaction`)
        .send({
          address: mockDynamicUserId,
          to: mockCustodialWalletAddress,
          amountInEth: 0.01,
          chainId: sepolia.id,
        })
        .expect(401);

      expect(res.body).toMatchInlineSnapshot(`
{
  "message": "Unauthorized",
  "statusCode": 401,
}
`);
    });

    it("should return 404 Not Found error if wallet doesn't exist", async () => {
      // Prep: generate a token that resolves to a user with no custodial wallets
      const token = generateJwtToken({
        sub: 'user-with-no-custodial-wallets',
      });

      const res = await request(app.getHttpServer())
        .post(`/custodial/wallet/sendTransaction`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          address: '0xINVALID',
          to: mockCustodialWalletAddress,
          amountInEth: 0.01,
          chainId: sepolia.id,
        })
        .expect(404);

      expect(res.body).toMatchInlineSnapshot(`
{
  "error": "Wallet not found",
  "message": "Wallet with address 0xINVALID not found",
}
`);
    });

    it('should throw 400 Bad Request error if chainId is not supported', async () => {
      const res = await request(app.getHttpServer())
        .post(`/custodial/wallet/sendTransaction`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          address: mockCustodialWalletAddress,
          to: mockCustodialWalletAddress,
          amountInEth: 0.01,
          chainId: polygon.id,
        })
        .expect(400);

      expect(res.body).toMatchInlineSnapshot(`
{
  "error": "Invalid chain ID",
  "message": "Chain ID 137 is not supported",
}
`);
    });

    it('should return 201 for successfully sending a transaction', async () => {
      const res = await request(app.getHttpServer())
        .post(`/custodial/wallet/sendTransaction`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          address: mockCustodialWalletAddress,
          to: mockCustodialWalletAddress,
          amountInEth: 0.01,
          chainId: sepolia.id,
        })
        .expect(201);

      expect(res.body).toHaveProperty('transactionHash', '0xTRANSACTION');
      expect(res.body).toHaveProperty('nonce', 1);
    });
  });

  describe('GET /custodial/wallet/messages/:address', () => {
    let mockDynamicUserId: string = 'existing-user';
    let mockCustodialWalletAddress: string;
    let token: string;

    beforeEach(async () => {
      // Prep: generate a token that resolves to a user with a custodial wallet
      token = generateJwtToken({
        sub: mockDynamicUserId,
      });

      // Prep: create the user with a custodial wallet in db
      const resWalletCreation = await request(app.getHttpServer())
        .post(`/custodial/wallet`)
        .set('Authorization', `Bearer ${token}`)
        .expect(201);
      mockCustodialWalletAddress = resWalletCreation.body.address;
    });

    it('should return 401 Unauthorized error if jwt token is missing', async () => {
      const res = await request(app.getHttpServer())
        .get(`/custodial/wallet/messages/${mockCustodialWalletAddress}`)
        .expect(401);

      expect(res.body).toMatchInlineSnapshot(`
{
  "message": "Unauthorized",
  "statusCode": 401,
}
`);
    });

    it("should return empty array if wallet hasn't signed any messages", async () => {
      const res = await request(app.getHttpServer())
        .get(`/custodial/wallet/messages/${mockCustodialWalletAddress}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const { items, ...rest } = res.body;
      expect(items).toHaveLength(0);
      expect(rest).toMatchInlineSnapshot(`
{
  "page": 1,
  "pageSize": 20,
  "totalCount": 0,
  "totalPages": 1,
}
`);
    });

    it('should return 1 page of 20 messages by default if wallet has signed messages and page & limit are not specified', async () => {
      // Prep: sign 30 messages for the custodial wallet
      const messages = Array.from({ length: 30 }, (_, i) => ({
        message: `test_message_${i}`,
        signature: `test_signature_${i}`,
        signatureIV: `test_signature_iv_${i}`,
      }));
      await prismaService.custodialWallet.update({
        where: {
          address: mockCustodialWalletAddress,
        },
        data: {
          messageHistory: {
            create: messages,
          },
        },
      });

      const res = await request(app.getHttpServer())
        .get(`/custodial/wallet/messages/${mockCustodialWalletAddress}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const { items, ...rest } = res.body;
      expect(items).toHaveLength(20);
      expect(rest).toMatchInlineSnapshot(`
{
  "page": 1,
  "pageSize": 20,
  "totalCount": 30,
  "totalPages": 2,
}
`);
    });

    it('should return 30 messages altogether if limit is set to greater than 30', async () => {
      // Prep: sign 30 messages for the custodial wallet
      const messages = Array.from({ length: 30 }, (_, i) => ({
        message: `test_message_${i}`,
        signature: `test_signature_${i}`,
        signatureIV: `test_signature_iv_${i}`,
      }));
      await prismaService.custodialWallet.update({
        where: {
          address: mockCustodialWalletAddress,
        },
        data: {
          messageHistory: {
            create: messages,
          },
        },
      });

      const res = await request(app.getHttpServer())
        .get(`/custodial/wallet/messages/${mockCustodialWalletAddress}`)
        .set('Authorization', `Bearer ${token}`)
        .query({
          limit: 50,
        })
        .expect(200);

      const { items, ...rest } = res.body;
      expect(items).toHaveLength(30);
      expect(rest).toMatchInlineSnapshot(`
{
  "page": 1,
  "pageSize": 50,
  "totalCount": 30,
  "totalPages": 1,
}
`);
    });

    it('should return 5 messages for 2nd page if limit is set to greater than 5 and page set to 2', async () => {
      // Prep: sign 30 messages for the custodial wallet
      const messages = Array.from({ length: 30 }, (_, i) => ({
        message: `test_message_${i}`,
        signature: `test_signature_${i}`,
        signatureIV: `test_signature_iv_${i}`,
      }));
      await prismaService.custodialWallet.update({
        where: {
          address: mockCustodialWalletAddress,
        },
        data: {
          messageHistory: {
            create: messages,
          },
        },
      });

      const res = await request(app.getHttpServer())
        .get(`/custodial/wallet/messages/${mockCustodialWalletAddress}`)
        .set('Authorization', `Bearer ${token}`)
        .query({
          limit: 5,
          page: 2,
        })
        .expect(200);

      const { items, ...rest } = res.body;
      expect(items).toHaveLength(5);
      expect(rest).toMatchInlineSnapshot(`
{
  "page": 2,
  "pageSize": 5,
  "totalCount": 30,
  "totalPages": 6,
}
`);
    });
  });
});
