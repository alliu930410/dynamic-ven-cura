// Ref: https://ethereum.stackexchange.com/questions/147756/read-transaction-history-with-ethers-v6-1-0
import { EtherscanProvider, Networkish, BlockTag } from 'ethers';

export default class MyEtherscanProvider extends EtherscanProvider {
  constructor(networkish: Networkish, apiKey?: string) {
    super(networkish, apiKey);
  }

  async getHistory(
    address: string,
    startBlock?: BlockTag,
    endBlock?: BlockTag,
  ): Promise<Array<any>> {
    const params = {
      action: 'txlist',
      address,
      startblock: startBlock == null ? 0 : startBlock,
      endblock: endBlock == null ? 99999999 : endBlock,
      sort: 'asc',
    };

    return this.fetch('account', params);
  }
}
