/**
 * Marketplace API Endpoints
 * Handles secondary market trading functionality
 */

import { Request, Response } from 'express';

// Mock data for development
const mockListings = [
    {
        id: '1',
        listingId: 1,
        groveName: 'Sunrise Valley Grove',
        sellerAddress: '0x789abc123def456789012345678901234567890',
        tokenAddress: '0xtoken1',
        tokenAmount: 10,
        pricePerToken: 28.00,
        originalPrice: 25.00,
        listingDate: new Date('2024-12-01').toISOString(),
        expirationDate: new Date('2024-12-31').toISOString(),
        coffeeVariety: 'Arabica',
        location: 'Costa Rica',
        healthScore: 85,
        isActive: true
    },
    {
        id: '2',
        listingId: 2,
        groveName: 'Mountain Peak Coffee',
        sellerAddress: '0xabcdef123456789012345678901234567890123',
        tokenAddress: '0xtoken2',
        tokenAmount: 5,
        pricePerToken: 32.00,
        originalPrice: 30.00,
        listingDate: new Date('2024-12-05').toISOString(),
        expirationDate: new Date('2024-12-31').toISOString(),
        coffeeVariety: 'Bourbon',
        location: 'Colombia',
        healthScore: 92,
        isActive: true
    },
    {
        id: '3',
        listingId: 3,
        groveName: 'Highland Estate',
        sellerAddress: '0xdef456789012345678901234567890123456789',
        tokenAddress: '0xtoken3',
        tokenAmount: 25,
        pricePerToken: 22.50,
        originalPrice: 20.00,
        listingDate: new Date('2024-12-10').toISOString(),
        expirationDate: new Date('2024-12-31').toISOString(),
        coffeeVariety: 'Geisha',
        location: 'Panama',
        healthScore: 78,
        isActive: true
    }
];

const mockTrades = [
    {
        id: '1',
        tradeId: 1,
        listingId: 1,
        groveName: 'Sunrise Valley Grove',
        seller: '0x789abc123def456789012345678901234567890',
        buyer: '0x123def456789012345678901234567890123456',
        tokenAmount: 5,
        pricePerToken: 28.00,
        totalPrice: 140.00,
        tradeDate: new Date('2024-12-15').toISOString()
    }
];

/**
 * Get all active marketplace listings
 */
export async function getMarketplaceListings(req: Request, res: Response) {
    try {
        // Filter only active listings
        const activeListings = mockListings.filter(listing => 
            listing.isActive && new Date(listing.expirationDate) > new Date()
        );

        res.json({
            success: true,
            listings: activeListings,
            total: activeListings.length
        });
    } catch (error) {
        console.error('Error fetching marketplace listings:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch marketplace listings'
        });
    }
}

/**
 * List tokens for sale on the marketplace
 */
export async function listTokensForSale(req: Request, res: Response) {
    try {
        const { groveId, tokenAmount, pricePerToken, durationDays, sellerAddress } = req.body;

        // Validate input
        if (!groveId || !tokenAmount || !pricePerToken || !durationDays || !sellerAddress) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        if (tokenAmount <= 0 || pricePerToken <= 0 || durationDays <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid values for amount, price, or duration'
            });
        }

        // Create new listing
        const newListing = {
            id: String(mockListings.length + 1),
            listingId: mockListings.length + 1,
            groveName: `Grove ${groveId}`,
            sellerAddress,
            tokenAddress: `0xtoken${groveId}`,
            tokenAmount,
            pricePerToken,
            originalPrice: pricePerToken * 0.9, // Assume 10% markup
            listingDate: new Date().toISOString(),
            expirationDate: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString(),
            coffeeVariety: 'Arabica',
            location: 'Unknown',
            healthScore: 80,
            isActive: true
        };

        mockListings.push(newListing);

        res.json({
            success: true,
            listing: newListing,
            message: 'Tokens listed for sale successfully'
        });
    } catch (error) {
        console.error('Error listing tokens for sale:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to list tokens for sale'
        });
    }
}

/**
 * Purchase tokens from marketplace listing
 */
export async function purchaseFromMarketplace(req: Request, res: Response) {
    try {
        const { listingId, tokenAmount, buyerAddress } = req.body;

        // Validate input
        if (!listingId || !tokenAmount || !buyerAddress) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        // Find listing
        const listing = mockListings.find(l => l.id === listingId && l.isActive);
        if (!listing) {
            return res.status(404).json({
                success: false,
                error: 'Listing not found or inactive'
            });
        }

        // Check if enough tokens available
        if (tokenAmount > listing.tokenAmount) {
            return res.status(400).json({
                success: false,
                error: 'Not enough tokens available'
            });
        }

        // Check if buyer is not the seller
        if (buyerAddress === listing.sellerAddress) {
            return res.status(400).json({
                success: false,
                error: 'Cannot buy your own listing'
            });
        }

        // Calculate costs
        const totalPrice = tokenAmount * listing.pricePerToken;
        const marketplaceFee = totalPrice * 0.025; // 2.5% fee
        const sellerReceives = totalPrice - marketplaceFee;

        // Create trade record
        const newTrade = {
            id: String(mockTrades.length + 1),
            tradeId: mockTrades.length + 1,
            listingId: parseInt(listingId),
            groveName: listing.groveName,
            seller: listing.sellerAddress,
            buyer: buyerAddress,
            tokenAmount,
            pricePerToken: listing.pricePerToken,
            totalPrice,
            tradeDate: new Date().toISOString()
        };

        mockTrades.push(newTrade);

        // Update listing
        listing.tokenAmount -= tokenAmount;
        if (listing.tokenAmount === 0) {
            listing.isActive = false;
        }

        res.json({
            success: true,
            trade: newTrade,
            totalPrice,
            marketplaceFee,
            sellerReceives,
            message: 'Tokens purchased successfully'
        });
    } catch (error) {
        console.error('Error purchasing from marketplace:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to purchase tokens'
        });
    }
}

/**
 * Cancel a marketplace listing
 */
export async function cancelListing(req: Request, res: Response) {
    try {
        const { listingId, sellerAddress } = req.body;

        // Find listing
        const listing = mockListings.find(l => l.id === listingId);
        if (!listing) {
            return res.status(404).json({
                success: false,
                error: 'Listing not found'
            });
        }

        // Check if user is the seller
        if (listing.sellerAddress !== sellerAddress) {
            return res.status(403).json({
                success: false,
                error: 'Only the seller can cancel this listing'
            });
        }

        // Cancel listing
        listing.isActive = false;

        res.json({
            success: true,
            message: 'Listing cancelled successfully'
        });
    } catch (error) {
        console.error('Error cancelling listing:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to cancel listing'
        });
    }
}

/**
 * Update a marketplace listing
 */
export async function updateListing(req: Request, res: Response) {
    try {
        const { listingId, newPrice, newDuration, sellerAddress } = req.body;

        // Find listing
        const listing = mockListings.find(l => l.id === listingId);
        if (!listing) {
            return res.status(404).json({
                success: false,
                error: 'Listing not found'
            });
        }

        // Check if user is the seller
        if (listing.sellerAddress !== sellerAddress) {
            return res.status(403).json({
                success: false,
                error: 'Only the seller can update this listing'
            });
        }

        // Update listing
        if (newPrice) {
            listing.pricePerToken = newPrice;
        }
        if (newDuration) {
            listing.expirationDate = new Date(Date.now() + newDuration * 24 * 60 * 60 * 1000).toISOString();
        }

        res.json({
            success: true,
            listing,
            message: 'Listing updated successfully'
        });
    } catch (error) {
        console.error('Error updating listing:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update listing'
        });
    }
}

/**
 * Get trade history
 */
export async function getTradeHistory(req: Request, res: Response) {
    try {
        const { userAddress } = req.query;

        let trades = mockTrades;

        // Filter by user address if provided
        if (userAddress) {
            trades = mockTrades.filter(trade => 
                trade.seller === userAddress || trade.buyer === userAddress
            );
        }

        // Sort by date (most recent first)
        trades.sort((a, b) => new Date(b.tradeDate).getTime() - new Date(a.tradeDate).getTime());

        res.json({
            success: true,
            trades,
            total: trades.length
        });
    } catch (error) {
        console.error('Error fetching trade history:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch trade history'
        });
    }
}

/**
 * Get marketplace statistics
 */
export async function getMarketplaceStats(req: Request, res: Response) {
    try {
        const activeListings = mockListings.filter(l => l.isActive);
        const totalTokensAvailable = activeListings.reduce((sum, listing) => sum + listing.tokenAmount, 0);
        const totalMarketValue = activeListings.reduce((sum, listing) => sum + (listing.tokenAmount * listing.pricePerToken), 0);
        const averagePrice = totalTokensAvailable > 0 ? totalMarketValue / totalTokensAvailable : 0;

        const totalTrades = mockTrades.length;
        const totalVolume = mockTrades.reduce((sum, trade) => sum + trade.totalPrice, 0);

        res.json({
            success: true,
            stats: {
                activeListings: activeListings.length,
                totalTokensAvailable,
                totalMarketValue,
                averagePrice,
                totalTrades,
                totalVolume
            }
        });
    } catch (error) {
        console.error('Error fetching marketplace stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch marketplace statistics'
        });
    }
}

/**
 * Get user's active listings
 */
export async function getUserListings(req: Request, res: Response) {
    try {
        const { sellerAddress } = req.query;

        if (!sellerAddress) {
            return res.status(400).json({
                success: false,
                error: 'Seller address is required'
            });
        }

        const userListings = mockListings.filter(listing => 
            listing.sellerAddress === sellerAddress && listing.isActive
        );

        res.json({
            success: true,
            listings: userListings,
            total: userListings.length
        });
    } catch (error) {
        console.error('Error fetching user listings:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user listings'
        });
    }
}