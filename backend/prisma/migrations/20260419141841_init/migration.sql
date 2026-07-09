/*
  Warnings:

  - You are about to drop the `Conversation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WishlistListing` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_participant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `adults` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `cancellationReason` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `cancelledAt` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `cancelledById` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `children` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `cleaningFee` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `confirmationCode` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `discount` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `guestId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `guestReviewed` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `infants` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `nights` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `ownerPayout` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `ownerReviewed` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `paymentStatus` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `pets` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `pricePerNight` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `refundAmount` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `serviceFee` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `specialRequests` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `stripePaymentIntentId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `stripeRefundId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `stripeSessionId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `subtotal` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `taxes` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `accuracyRating` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `additionalRules` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `advanceNotice` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `availableFrom` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `availableTo` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `avgRating` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `checkInRating` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `cleanlinessRating` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `communicationRating` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `images` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `locationRating` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `monthlyDiscount` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `partiesAllowed` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `selfCheckIn` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `smokingAllowed` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `totalReviews` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `valueRating` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `weeklyDiscount` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `accuracyRating` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `bookingId` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `checkInRating` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `cleanlinessRating` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `communicationRating` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `hostId` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `hostResponse` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `hostResponseAt` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `isPublished` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `locationRating` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `overallRating` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `reviewType` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `valueRating` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `avatarPublicId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `banReason` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `bio` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerificationExpire` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerificationToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `googleId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `hostSince` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isBanned` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isEmailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isHost` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `language` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `languages` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastLogin` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `provider` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `resetPasswordExpire` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `resetPasswordToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `responseRate` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `responseTime` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `stripeAccountId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `stripeCustomerId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Wishlist` table. All the data in the column will be lost.
  - You are about to drop the column `isPublic` on the `Wishlist` table. All the data in the column will be lost.
  - Added the required column `guestCount` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Made the column `state` on table `Listing` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `rating` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Made the column `comment` on table `Review` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Conversation_lastMessageAt_idx";

-- DropIndex
DROP INDEX "Message_senderId_idx";

-- DropIndex
DROP INDEX "Message_conversationId_createdAt_idx";

-- DropIndex
DROP INDEX "Notification_senderId_idx";

-- DropIndex
DROP INDEX "Notification_recipientId_isRead_idx";

-- DropIndex
DROP INDEX "_participant_B_index";

-- DropIndex
DROP INDEX "_participant_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Conversation";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Message";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Notification";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "WishlistListing";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_participant";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "WishlistItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "wishlistId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    CONSTRAINT "WishlistItem_wishlistId_fkey" FOREIGN KEY ("wishlistId") REFERENCES "Wishlist" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WishlistItem_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "checkIn" DATETIME NOT NULL,
    "checkOut" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "totalPrice" REAL NOT NULL,
    "guestCount" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "listingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Booking_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("checkIn", "checkOut", "createdAt", "id", "listingId", "status", "totalPrice", "updatedAt") SELECT "checkIn", "checkOut", "createdAt", "id", "listingId", "status", "totalPrice", "updatedAt" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
CREATE TABLE "new_Listing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "propertyType" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "zipCode" TEXT,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "maxGuests" INTEGER NOT NULL,
    "totalRooms" INTEGER NOT NULL,
    "bedrooms" INTEGER NOT NULL,
    "beds" INTEGER NOT NULL,
    "bathrooms" REAL NOT NULL,
    "pricePerNight" REAL NOT NULL,
    "cleaningFee" REAL NOT NULL DEFAULT 0,
    "serviceFee" REAL NOT NULL DEFAULT 0,
    "amenities" TEXT,
    "checkInTime" TEXT NOT NULL DEFAULT '15:00',
    "checkOutTime" TEXT NOT NULL DEFAULT '11:00',
    "petsAllowed" BOOLEAN NOT NULL DEFAULT false,
    "instantBook" BOOLEAN NOT NULL DEFAULT false,
    "minNights" INTEGER NOT NULL DEFAULT 1,
    "maxNights" INTEGER NOT NULL DEFAULT 365,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "averageRating" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ownerId" TEXT NOT NULL,
    CONSTRAINT "Listing_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Listing" ("address", "amenities", "bathrooms", "bedrooms", "beds", "category", "checkInTime", "checkOutTime", "city", "cleaningFee", "country", "createdAt", "description", "id", "instantBook", "isFeatured", "latitude", "longitude", "maxGuests", "maxNights", "minNights", "ownerId", "petsAllowed", "pricePerNight", "propertyType", "serviceFee", "slug", "state", "status", "title", "totalRooms", "updatedAt", "viewCount", "zipCode") SELECT "address", "amenities", "bathrooms", "bedrooms", "beds", "category", "checkInTime", "checkOutTime", "city", "cleaningFee", "country", "createdAt", "description", "id", "instantBook", "isFeatured", "latitude", "longitude", "maxGuests", "maxNights", "minNights", "ownerId", "petsAllowed", "pricePerNight", "propertyType", "serviceFee", "slug", "state", "status", "title", "totalRooms", "updatedAt", "viewCount", "zipCode" FROM "Listing";
DROP TABLE "Listing";
ALTER TABLE "new_Listing" RENAME TO "Listing";
CREATE UNIQUE INDEX "Listing_slug_key" ON "Listing"("slug");
CREATE TABLE "new_Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "listingId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    CONSTRAINT "Review_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Review" ("comment", "createdAt", "id", "listingId", "reviewerId", "updatedAt") SELECT "comment", "createdAt", "id", "listingId", "reviewerId", "updatedAt" FROM "Review";
DROP TABLE "Review";
ALTER TABLE "new_Review" RENAME TO "Review";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "isSuperhost" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("avatarUrl", "createdAt", "email", "id", "isSuperhost", "name", "updatedAt") SELECT "avatarUrl", "createdAt", "email", "id", "isSuperhost", "name", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE TABLE "new_Wishlist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT 'My Favorites',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Wishlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Wishlist" ("createdAt", "id", "name", "updatedAt", "userId") SELECT "createdAt", "id", "name", "updatedAt", "userId" FROM "Wishlist";
DROP TABLE "Wishlist";
ALTER TABLE "new_Wishlist" RENAME TO "Wishlist";
CREATE UNIQUE INDEX "Wishlist_userId_key" ON "Wishlist"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
