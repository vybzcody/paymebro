/**
 * EIP-681: URL Format for Transaction Requests
 * https://eips.ethereum.org/EIPS/eip-681
 * 
 * This utility ensures proper EIP-681 compliance for Ethereum payment URLs
 * so they are correctly detected by mobile wallets when scanned via QR codes.
 */

/**
 * Generate EIP-681 compliant URL for native ETH transfers
 * Format: ethereum:<address>@<chainId>?value=<amount_in_wei>
 */
export function generateEthTransferURL(params: {
  recipient: string;
  chainId: number;
  amount: string; // Amount in ETH (decimal)
  gas?: string;
  gasPrice?: string;
}): string {
  const { recipient, chainId, amount, gas, gasPrice } = params;
  
  // Validate recipient address
  if (!isValidEthereumAddress(recipient)) {
    throw new Error('Invalid recipient address');
  }
  
  // Convert ETH amount to Wei (using BigInt for precision)
  const amountInWei = BigInt(parseFloat(amount) * 10**18).toString();
  
  // Use lowercase address for compliance
  const recipientLower = recipient.toLowerCase();
  
  // Build URL with required parameters
  let url = `ethereum:${recipientLower}@${chainId}?value=${amountInWei}`;
  
  // Add optional parameters if provided
  if (gas) {
    url += `&gas=${gas}`;
  }
  if (gasPrice) {
    url += `&gasPrice=${gasPrice}`;
  }
  
  return url;
}

/**
 * Generate EIP-681 compliant URL for ERC-20 token transfers
 * Format: ethereum:<contract_address>@<chainId>/transfer?address=<recipient>&uint256=<amount>
 */
export function generateTokenTransferURL(params: {
  tokenContract: string;
  recipient: string;
  chainId: number;
  amount: string; // Amount in token units (decimal)
  decimals: number; // Token decimals (e.g., 6 for USDC, 18 for most tokens)
  gas?: string;
  gasPrice?: string;
}): string {
  const { tokenContract, recipient, chainId, amount, decimals, gas, gasPrice } = params;
  
  // Validate addresses
  if (!isValidEthereumAddress(tokenContract)) {
    throw new Error('Invalid token contract address');
  }
  if (!isValidEthereumAddress(recipient)) {
    throw new Error('Invalid recipient address');
  }
  
  // Convert token amount to smallest unit
  const amountInSmallestUnit = BigInt(parseFloat(amount) * 10**decimals).toString();
  
  // Use lowercase addresses for compliance
  const tokenContractLower = tokenContract.toLowerCase();
  const recipientLower = recipient.toLowerCase();
  
  // Build URL with required parameters
  let url = `ethereum:${tokenContractLower}@${chainId}/transfer?address=${recipientLower}&uint256=${amountInSmallestUnit}`;
  
  // Add optional parameters if provided
  if (gas) {
    url += `&gas=${gas}`;
  }
  if (gasPrice) {
    url += `&gasPrice=${gasPrice}`;
  }
  
  return url;
}

/**
 * Generate EIP-681 compliant URL for contract function calls
 * Format: ethereum:<contract_address>@<chainId>/<function_name>?<param1>=<value1>&<param2>=<value2>
 */
export function generateContractCallURL(params: {
  contract: string;
  chainId: number;
  functionName: string;
  parameters: Record<string, string>;
  gas?: string;
  gasPrice?: string;
  value?: string; // ETH value to send with transaction (in wei)
}): string {
  const { contract, chainId, functionName, parameters, gas, gasPrice, value } = params;
  
  // Validate contract address
  if (!isValidEthereumAddress(contract)) {
    throw new Error('Invalid contract address');
  }
  
  // Use lowercase address for compliance
  const contractLower = contract.toLowerCase();
  
  // Build base URL
  let url = `ethereum:${contractLower}@${chainId}/${functionName}`;
  
  // Add function parameters
  const paramEntries = Object.entries(parameters);
  if (paramEntries.length > 0) {
    const paramString = paramEntries
      .map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
      .join('&');
    url += `?${paramString}`;
  }
  
  // Add optional parameters
  const optionalParams: string[] = [];
  if (value) {
    optionalParams.push(`value=${value}`);
  }
  if (gas) {
    optionalParams.push(`gas=${gas}`);
  }
  if (gasPrice) {
    optionalParams.push(`gasPrice=${gasPrice}`);
  }
  
  if (optionalParams.length > 0) {
    const separator = paramEntries.length > 0 ? '&' : '?';
    url += separator + optionalParams.join('&');
  }
  
  return url;
}

/**
 * Validate if a string is a valid Ethereum address
 */
export function isValidEthereumAddress(address: string): boolean {
  // Basic validation: should be 42 characters (0x + 40 hex chars)
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return false;
  }
  return true;
}

/**
 * Parse an EIP-681 URL and extract its components
 */
export function parseEIP681URL(url: string): {
  scheme: string;
  address: string;
  chainId?: number;
  functionName?: string;
  parameters: Record<string, string>;
} {
  // Remove ethereum: scheme
  if (!url.startsWith('ethereum:')) {
    throw new Error('Invalid EIP-681 URL: must start with ethereum:');
  }
  
  const withoutScheme = url.slice('ethereum:'.length);
  
  // Parse address and chain ID
  let address: string;
  let chainId: number | undefined;
  let functionName: string | undefined;
  let paramString = '';
  
  // Check for chain ID
  if (withoutScheme.includes('@')) {
    const [addressPart, rest] = withoutScheme.split('@');
    address = addressPart;
    
    // Check for function name
    if (rest.includes('/')) {
      const [chainPart, functionPart] = rest.split('/');
      chainId = parseInt(chainPart);
      
      if (functionPart.includes('?')) {
        const [funcName, params] = functionPart.split('?');
        functionName = funcName;
        paramString = params;
      } else {
        functionName = functionPart;
      }
    } else if (rest.includes('?')) {
      const [chainPart, params] = rest.split('?');
      chainId = parseInt(chainPart);
      paramString = params;
    } else {
      chainId = parseInt(rest);
    }
  } else {
    // No chain ID specified
    if (withoutScheme.includes('?')) {
      const [addressPart, params] = withoutScheme.split('?');
      address = addressPart;
      paramString = params;
    } else {
      address = withoutScheme;
    }
  }
  
  // Parse parameters
  const parameters: Record<string, string> = {};
  if (paramString) {
    const paramPairs = paramString.split('&');
    for (const pair of paramPairs) {
      const [key, value] = pair.split('=');
      if (key && value) {
        parameters[key] = decodeURIComponent(value);
      }
    }
  }
  
  return {
    scheme: 'ethereum',
    address,
    chainId,
    functionName,
    parameters
  };
}

/**
 * Validate an EIP-681 URL for proper formatting
 */
export function validateEIP681URL(url: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  try {
    const parsed = parseEIP681URL(url);
    
    // Validate address
    if (!isValidEthereumAddress(parsed.address)) {
      errors.push('Invalid Ethereum address format');
    }
    
    // Validate chain ID if present
    if (parsed.chainId !== undefined && (parsed.chainId < 1 || !Number.isInteger(parsed.chainId))) {
      errors.push('Invalid chain ID: must be a positive integer');
    }
    
    // Validate function name if present
    if (parsed.functionName !== undefined && !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(parsed.functionName)) {
      errors.push('Invalid function name format');
    }
    
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Failed to parse URL');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Common USDC contract addresses for different chains
 */
export const USDC_ADDRESSES: Record<number, string> = {
  // Mainnet
  1: "0xA0b86a33E6441b8435b662f98137B4B1c5b0c8c1", // Ethereum
  137: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", // Polygon
  42161: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // Arbitrum
  43114: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", // Avalanche
  8453: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base
  
  // Testnet
  11155111: "0x1c7d4b196cb0c7b01d743fbc6116a902379c7238", // ETH Sepolia
  80002: "0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582", // Polygon Amoy
  84532: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // Base Sepolia
  43113: "0x5425890298aed601595a70AB815c96711a31Bc65", // AVAX Fuji
};

/**
 * Get USDC contract address for a specific chain
 */
export function getUSDCAddress(chainId: number): string {
  const address = USDC_ADDRESSES[chainId];
  if (!address) {
    throw new Error(`USDC contract address not found for chain ID: ${chainId}`);
  }
  return address;
}
