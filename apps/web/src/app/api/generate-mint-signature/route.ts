import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';

// Types for the mint request
interface MintRequest {
  to: string;
  primarySaleRecipient: string;
  quantity: string;
  price: string;
  currency: string;
  validityStartTimestamp: number;
  validityEndTimestamp: number;
  uid: string;
}

interface ApiRequest {
  walletAddress: string;
  points: number;
}

// EIP-712 types - MUST match contract exactly
const MINT_REQUEST_TYPES = {
  MintRequest: [
    { name: 'to', type: 'address' },
    { name: 'primarySaleRecipient', type: 'address' },
    { name: 'quantity', type: 'uint256' },
    { name: 'price', type: 'uint256' },
    { name: 'currency', type: 'address' },
    { name: 'validityStartTimestamp', type: 'uint128' },
    { name: 'validityEndTimestamp', type: 'uint128' },
    { name: 'uid', type: 'bytes32' },
  ],
};

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, points }: ApiRequest = await request.json();

    // Validation
    if (!walletAddress || !points) {
      return NextResponse.json(
        { error: 'Missing required fields: walletAddress and points' },
        { status: 400 }
      );
    }

    if (points < 1 || points > 100) {
      return NextResponse.json(
        { error: 'Invalid token amount, please try again' },
        { status: 400 }
      );
    }

    // Validate wallet address format
    try {
      ethers.getAddress(walletAddress);
    } catch {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    // Read configuration from apps/web/.env.local
    const envPath = path.join(process.cwd(), '.env.local');
    let envContent: string;
    
    try {
      envContent = fs.readFileSync(envPath, 'utf8');
    } catch (error) {
      return NextResponse.json(
        { error: 'Configuration file not found' },
        { status: 500 }
      );
    }

    // Parse environment variables
    const envVars = envContent
      .split('\n')
      .filter(line => line.trim() && !line.startsWith('#'))
      .reduce((acc, line) => {
        const [key, value] = line.split('=');
        acc[key.trim()] = value.trim();
        return acc;
      }, {} as Record<string, string>);

    const {
      CONTRACT_ADDRESS,
      PRIVATE_KEY,
      RPC_URL,
      CHAIN_ID,
      DOMAIN_NAME,
      DOMAIN_VERSION
    } = envVars;

    if (!CONTRACT_ADDRESS || !PRIVATE_KEY || !RPC_URL || !CHAIN_ID) {
      return NextResponse.json(
        { error: 'Missing required environment variables' },
        { status: 500 }
      );
    }

    // Create provider and wallet
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    // Generate unique UID for replay attack prevention
    const uid = ethers.keccak256(ethers.toUtf8Bytes(`${walletAddress}-${points}-${Date.now()}`));

    // Calculate timestamps (1 minute validity)
    const now = Math.floor(Date.now() / 1000);
    const validityStartTimestamp = now;
    const validityEndTimestamp = now + 60; // 1 minute

    // Create mint request
    const mintRequest: MintRequest = {
      to: walletAddress,
      primarySaleRecipient: walletAddress, // Use recipient address for free mints
      quantity: (points * 1e18).toString(), // Convert to wei
      price: '0', // Free mints
      currency: '0x0000000000000000000000000000000000000000', // Zero address for native currency on Celo
      validityStartTimestamp,
      validityEndTimestamp,
      uid,
    };

    // EIP-712 domain - MUST match contract's eip712Domain() exactly
    const domain = {
      name: 'FruitCrush', // This should match the contract's domain name
      version: '1',
      chainId: parseInt(CHAIN_ID),
      verifyingContract: CONTRACT_ADDRESS,
    };

    // Sign the mint request
    console.log('Signing with domain:', domain);
    console.log('Signing with types:', MINT_REQUEST_TYPES);
    console.log('Signing with data:', mintRequest);
    
    const signature = await wallet.signTypedData(domain, MINT_REQUEST_TYPES, mintRequest);
    
    console.log('Generated signature:', signature);
    console.log('Signer address:', wallet.address);
    
    // Verify the signature locally
    try {
      const recoveredAddress = ethers.verifyTypedData(domain, MINT_REQUEST_TYPES, mintRequest, signature);
      console.log('Recovered address:', recoveredAddress);
      console.log('Addresses match:', recoveredAddress.toLowerCase() === wallet.address.toLowerCase());
    } catch (verifyError) {
      console.error('Signature verification failed:', verifyError);
    }

    // Return the signed mint request
    return NextResponse.json({
      mintRequest,
      signature,
      domain,
    });

  } catch (error) {
    console.error('Error generating mint signature:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
