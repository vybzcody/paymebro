import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, decimal, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
// Enums
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'confirmed', 'failed', 'expired']);
export const chainEnum = pgEnum('chain', ['solana', 'ethereum', 'polygon', 'arbitrum', 'optimism', 'avalanche']);
// Users table
export const users = pgTable("users", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    web3auth_user_id: text("web3auth_user_id").notNull().unique(),
    email: text("email").notNull(),
    solana_address: text("solana_address").notNull(),
    ethereum_address: text("ethereum_address").notNull(),
    polygon_address: text("polygon_address"),
    arbitrum_address: text("arbitrum_address"),
    optimism_address: text("optimism_address"),
    avalanche_address: text("avalanche_address"),
    first_name: text("first_name"),
    last_name: text("last_name"),
    business_name: text("business_name"),
    phone_number: text("phone_number"),
    country: text("country"),
    onboarding_completed: boolean("onboarding_completed").default(false),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
});
// Payments table
export const payments = pgTable("payments", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    reference: text("reference").notNull().unique(),
    web3auth_user_id: text("web3auth_user_id").notNull(),
    amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
    currency: text("currency").notNull(),
    chain: chainEnum("chain").notNull(),
    recipient_address: text("recipient_address").notNull(),
    label: text("label").notNull(),
    message: text("message").notNull(),
    memo: text("memo"),
    status: paymentStatusEnum("status").default('pending'),
    transaction_signature: text("transaction_signature"),
    customer_email: text("customer_email").notNull(),
    spl_token_mint: text("spl_token_mint").notNull(),
    fee_amount: decimal("fee_amount", { precision: 18, scale: 8 }).notNull(),
    merchant_amount: decimal("merchant_amount", { precision: 18, scale: 8 }).notNull(),
    total_amount_paid: decimal("total_amount_paid", { precision: 18, scale: 8 }).notNull(),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
});
// Payment templates table
export const paymentTemplates = pgTable("payment_templates", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    name: text("name").notNull(),
    amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
    currency: text("currency").notNull(),
    label: text("label").notNull(),
    message: text("message").notNull(),
    spl_token_mint: text("spl_token_mint"),
    web3auth_user_id: text("web3auth_user_id").notNull(),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
});
// Insert schemas
const baseInsertUserSchema = createInsertSchema(users);
export const insertUserSchema = z.object({
    web3auth_user_id: baseInsertUserSchema.shape.web3auth_user_id,
    email: baseInsertUserSchema.shape.email,
    solana_address: baseInsertUserSchema.shape.solana_address,
    ethereum_address: baseInsertUserSchema.shape.ethereum_address,
    polygon_address: baseInsertUserSchema.shape.polygon_address,
    arbitrum_address: baseInsertUserSchema.shape.arbitrum_address,
    optimism_address: baseInsertUserSchema.shape.optimism_address,
    avalanche_address: baseInsertUserSchema.shape.avalanche_address,
    first_name: baseInsertUserSchema.shape.first_name,
    last_name: baseInsertUserSchema.shape.last_name,
    business_name: baseInsertUserSchema.shape.business_name,
    phone_number: baseInsertUserSchema.shape.phone_number,
    country: baseInsertUserSchema.shape.country,
});
const baseInsertPaymentSchema = createInsertSchema(payments);
export const insertPaymentSchema = z.object({
    web3auth_user_id: baseInsertPaymentSchema.shape.web3auth_user_id,
    amount: baseInsertPaymentSchema.shape.amount,
    currency: baseInsertPaymentSchema.shape.currency,
    chain: baseInsertPaymentSchema.shape.chain,
    label: baseInsertPaymentSchema.shape.label,
    message: baseInsertPaymentSchema.shape.message,
    memo: baseInsertPaymentSchema.shape.memo,
    customer_email: baseInsertPaymentSchema.shape.customer_email,
    spl_token_mint: baseInsertPaymentSchema.shape.spl_token_mint,
});
const baseInsertPaymentTemplateSchema = createInsertSchema(paymentTemplates);
export const insertPaymentTemplateSchema = z.object({
    name: baseInsertPaymentTemplateSchema.shape.name,
    amount: baseInsertPaymentTemplateSchema.shape.amount,
    currency: baseInsertPaymentTemplateSchema.shape.currency,
    label: baseInsertPaymentTemplateSchema.shape.label,
    message: baseInsertPaymentTemplateSchema.shape.message,
    spl_token_mint: baseInsertPaymentTemplateSchema.shape.spl_token_mint,
    web3auth_user_id: baseInsertPaymentTemplateSchema.shape.web3auth_user_id,
});
export const onboardingSchema = z.object({
    web3AuthUserId: z.string(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    businessName: z.string().optional(),
    phoneNumber: z.string().optional(),
    country: z.string().optional(),
});
