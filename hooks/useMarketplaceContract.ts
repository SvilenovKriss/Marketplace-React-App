import MARKETPLACE_ABI from "../contracts/Marketplace.json";
import useContract from "./useContract";

export default function useMarketplaceContract(contractAddress?: string) {
  return useContract(contractAddress, MARKETPLACE_ABI);
}
