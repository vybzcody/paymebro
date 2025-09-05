# MediVet Backend Architecture & Database Schema

## Overview
This document outlines the backend architecture for MediVet, a decentralized health records platform using Ethereum-based wallets and Filecoin cloud storage for secure, patient-controlled health data management.

## Core Principles
- **Patient-Controlled Access**: Patients own and control all their health data
- **Ethereum Wallet Integration**: Secure authentication using MetaMask, WalletConnect, and other Ethereum wallets
- **Filecoin Cloud Storage**: Decentralized storage for encrypted health records
- **Smart Contract Permissions**: Blockchain-based access control and audit trails
- **Zero-Trust Architecture**: All access requires explicit permission and verification
- **Comprehensive Audit Trail**: Every action is logged on-chain and immutable
- **HIPAA Compliance**: Full compliance with healthcare data regulations

## Wallet & Storage System

### User Identity Schema
```typescript
interface UserIdentity {
  id: string;                    // UUID v4
  walletAddress: string;         // Ethereum wallet address (unique identifier)
  walletType: string;           // 'metamask', 'walletconnect', 'coinbase', etc.
  encryptionPublicKey: string;   // Public key for data encryption
  filecoinCID: string;          // Content Identifier for user's data on Filecoin
  storageDeals: StorageDeal[];   // Active Filecoin storage deals
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface StorageDeal {
  id: string;
  dealId: string;               // Filecoin deal ID
  minerAddress: string;         // Storage miner address
  dataSize: number;             // Size in bytes
  duration: number;             // Deal duration in epochs
  price: string;                // Storage price in FIL
  status: 'active' | 'expired' | 'failed';
  createdAt: Date;
}
```

### Encryption & Storage Functions (Pseudocode)
```typescript
// Wallet-Based Encryption Functions
function connectWallet(walletType: string): Promise<{ address: string, publicKey: string }>
function signMessage(message: string, walletAddress: string): Promise<string>
function encryptData(data: any, publicKey: string): EncryptedData
function decryptData(encryptedData: EncryptedData, privateKey: string): any
function uploadToFilecoin(encryptedData: EncryptedData): Promise<{ cid: string, dealId: string }>
function retrieveFromFilecoin(cid: string): Promise<EncryptedData>
```

## Core Database Schema

### 1. Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address VARCHAR(42) UNIQUE NOT NULL,
  wallet_type VARCHAR(50) NOT NULL,
  encryption_public_key VARCHAR(512) NOT NULL,
  filecoin_cid VARCHAR(128),
  user_type ENUM('patient', 'provider', 'admin', 'researcher') NOT NULL,
  email VARCHAR(255) UNIQUE,
  email_verified BOOLEAN DEFAULT FALSE,
  phone VARCHAR(20),
  phone_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP,
  failed_login_attempts INTEGER DEFAULT 0,
  account_locked_until TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_type ON users(user_type);
```

### 2. Patients Table
```sql
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Encrypted Personal Information
  encrypted_name TEXT NOT NULL,              -- IBE encrypted
  encrypted_date_of_birth TEXT NOT NULL,    -- IBE encrypted
  encrypted_address TEXT,                   -- IBE encrypted (optional)
  encrypted_phone TEXT,                     -- IBE encrypted (optional)
  
  -- Emergency Contact (Encrypted)
  encrypted_emergency_contact TEXT,         -- JSON: {name, phone, relationship}
  
  -- Profile Information
  avatar_url VARCHAR(500),
  timezone VARCHAR(50) DEFAULT 'UTC',
  preferred_language VARCHAR(10) DEFAULT 'en',
  
  -- Privacy Settings
  allow_family_access BOOLEAN DEFAULT FALSE,
  allow_anonymous_research BOOLEAN DEFAULT FALSE,
  audit_logging_enabled BOOLEAN DEFAULT TRUE,
  allow_emergency_override BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  profile_completion_percentage INTEGER DEFAULT 0,
  last_profile_update TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_patients_user_id ON patients(user_id);
```

### 3. Providers Table
```sql
CREATE TABLE providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Encrypted Provider Information
  encrypted_name TEXT NOT NULL,
  encrypted_specialty TEXT NOT NULL,
  encrypted_organization TEXT NOT NULL,
  encrypted_phone TEXT,
  encrypted_address TEXT,
  
  -- Professional Information
  license_number VARCHAR(100),
  license_state VARCHAR(2),
  license_expiry DATE,
  npi_number VARCHAR(10),              -- National Provider Identifier
  dea_number VARCHAR(20),              -- Drug Enforcement Administration number
  
  -- Verification Status
  is_verified BOOLEAN DEFAULT FALSE,
  verification_date TIMESTAMP,
  verification_method VARCHAR(50),
  
  -- Profile Information
  avatar_url VARCHAR(500),
  bio TEXT,
  specializations TEXT[],              -- Array of specializations
  languages_spoken TEXT[],
  
  -- Settings
  accepts_new_patients BOOLEAN DEFAULT TRUE,
  telehealth_enabled BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_providers_user_id ON providers(user_id);
CREATE INDEX idx_providers_npi ON providers(npi_number);
CREATE INDEX idx_providers_license ON providers(license_number);
```

### 4. Medical Records Table
```sql
CREATE TABLE medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Record Classification
  record_type ENUM('lab', 'imaging', 'prescription', 'visit', 'vital', 'allergy', 'procedure', 'vaccination') NOT NULL,
  category ENUM('preventive', 'diagnostic', 'treatment', 'emergency', 'routine', 'chronic_care', 'mental_health') NOT NULL,
  
  -- Filecoin Storage
  filecoin_cid VARCHAR(128) NOT NULL,     -- Content Identifier on Filecoin
  filecoin_deal_id VARCHAR(128),          -- Storage deal ID
  storage_miner VARCHAR(128),             -- Miner address
  encryption_key_hash VARCHAR(256),       -- Hash of encryption key used
  
  -- Metadata (Encrypted)
  encrypted_title TEXT NOT NULL,
  encrypted_description TEXT NOT NULL,
  encrypted_notes TEXT,
  
  -- Record Information
  record_date DATE NOT NULL,
  provider_id UUID REFERENCES providers(id),
  encrypted_provider_name TEXT,           -- Fallback if provider not in system
  
  -- Sensitivity & Access Control
  sensitivity_level ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
  is_sensitive BOOLEAN DEFAULT FALSE,
  requires_explicit_consent BOOLEAN DEFAULT FALSE,
  
  -- Tags and Classification
  tags TEXT[],                           -- Searchable tags
  icd_10_codes TEXT[],                   -- Medical coding
  cpt_codes TEXT[],                      -- Procedure codes
  
  -- Sharing and Access
  shared_with_provider_ids UUID[],       -- Array of provider IDs with access
  family_relevant BOOLEAN DEFAULT FALSE,
  
  -- Versioning
  version INTEGER DEFAULT 1,
  parent_record_id UUID REFERENCES medical_records(id),
  is_latest_version BOOLEAN DEFAULT TRUE,
  
  -- Audit Fields
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP                   -- Soft delete
);

CREATE INDEX idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX idx_medical_records_filecoin_cid ON medical_records(filecoin_cid);
CREATE INDEX idx_medical_records_type ON medical_records(record_type);
CREATE INDEX idx_medical_records_date ON medical_records(record_date);
CREATE INDEX idx_medical_records_sensitivity ON medical_records(sensitivity_level);
CREATE INDEX idx_medical_records_tags ON medical_records USING GIN(tags);
```

### 5. Medical Attachments Table
```sql
CREATE TABLE medical_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medical_record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
  
  -- File Information
  original_filename VARCHAR(255) NOT NULL,
  file_type ENUM('pdf', 'image', 'document', 'video', 'audio', 'dicom') NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  
  -- Filecoin Storage
  filecoin_cid VARCHAR(128) NOT NULL,     -- Content Identifier on Filecoin
  filecoin_deal_id VARCHAR(128),          -- Storage deal ID
  storage_miner VARCHAR(128),             -- Miner address
  encryption_key_hash VARCHAR(256),       -- Hash of encryption key used
  checksum VARCHAR(64) NOT NULL,          -- File integrity verification
  
  -- Access Tracking
  access_count INTEGER DEFAULT 0,
  last_accessed TIMESTAMP,
  
  -- Metadata
  encrypted_description TEXT,
  thumbnail_cid VARCHAR(128),             -- Filecoin CID for thumbnail
  
  -- Audit Fields
  uploaded_by UUID NOT NULL REFERENCES users(id),
  uploaded_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_attachments_record_id ON medical_attachments(medical_record_id);
CREATE INDEX idx_attachments_filecoin_cid ON medical_attachments(filecoin_cid);
CREATE INDEX idx_attachments_type ON medical_attachments(file_type);
```

### 6. Smart Contract Permissions System
```sql
CREATE TABLE permission_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  permissions JSONB NOT NULL,              -- Structured permission object
  is_system_template BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE patient_provider_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  
  -- Smart Contract Information
  contract_address VARCHAR(42) NOT NULL,   -- Ethereum contract address
  transaction_hash VARCHAR(66) NOT NULL,   -- Transaction hash for permission grant
  block_number BIGINT NOT NULL,           -- Block number when permission was granted
  
  -- Encrypted Permissions
  encrypted_permissions JSONB NOT NULL,   -- Encrypted permission object
  
  -- Permission Structure:
  -- {
  --   "basic_info": { "read": true, "write": false },
  --   "medical_history": { "read": true, "write": false },
  --   "lab_results": { "read": true, "write": false },
  --   "imaging": { "read": false, "write": false },
  --   "prescriptions": { "read": true, "write": true },
  --   "vitals": { "read": true, "write": false },
  --   "allergies": { "read": true, "write": false },
  --   "emergency_contact": { "read": true, "write": false },
  --   "mental_health": { "read": false, "write": false },
  --   "genetic_data": { "read": false, "write": false },
  --   "insurance_info": { "read": true, "write": false }
  -- }
  
  -- Access Control
  is_active BOOLEAN DEFAULT TRUE,
  granted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP,                   -- Optional expiration
  last_used TIMESTAMP,
  
  -- Emergency Override
  emergency_override_enabled BOOLEAN DEFAULT TRUE,
  emergency_override_used TIMESTAMP,
  emergency_override_reason TEXT,
  
  -- Audit Fields
  granted_by UUID NOT NULL REFERENCES users(id),  -- Usually the patient
  revoked_by UUID REFERENCES users(id),
  revoked_at TIMESTAMP,
  revoke_reason TEXT,
  revoke_transaction_hash VARCHAR(66),    -- Transaction hash for revocation
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  UNIQUE(patient_id, provider_id)
);

CREATE INDEX idx_permissions_patient_id ON patient_provider_permissions(patient_id);
CREATE INDEX idx_permissions_provider_id ON patient_provider_permissions(provider_id);
CREATE INDEX idx_permissions_contract ON patient_provider_permissions(contract_address);
CREATE INDEX idx_permissions_active ON patient_provider_permissions(is_active);
```
### 7. Medications Table
```sql
CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Medication Information (Encrypted)
  encrypted_name TEXT NOT NULL,
  encrypted_generic_name TEXT NOT NULL,
  encrypted_brand_name TEXT,
  encrypted_dosage TEXT NOT NULL,
  encrypted_instructions TEXT NOT NULL,
  
  -- Prescription Details
  frequency VARCHAR(50) NOT NULL,         -- 'daily', 'twice_daily', 'as_needed'
  route ENUM('oral', 'topical', 'injection', 'inhaled', 'sublingual', 'other') NOT NULL,
  
  -- Provider Information
  prescribed_by UUID REFERENCES providers(id),
  encrypted_prescriber_name TEXT,         -- Fallback if provider not in system
  prescribed_date DATE NOT NULL,
  
  -- Schedule
  start_date DATE NOT NULL,
  end_date DATE,
  refills_remaining INTEGER DEFAULT 0,
  total_refills INTEGER DEFAULT 0,
  
  -- Classification
  category ENUM('cardiovascular', 'diabetes', 'pain', 'antibiotic', 'mental_health', 'allergy', 'other') NOT NULL,
  priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  
  -- Drug Information
  ndc_code VARCHAR(20),                   -- National Drug Code
  rx_number VARCHAR(50),
  
  -- Side Effects and Interactions (Encrypted)
  encrypted_side_effects TEXT,            -- JSON array of side effects
  
  -- Cost Information (Encrypted)
  encrypted_cost_info TEXT,               -- JSON: {copay, insurance, total}
  
  -- Pharmacy Information (Encrypted)
  encrypted_pharmacy_info TEXT,           -- JSON: {id, name, phone, address}
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  discontinued_date DATE,
  discontinuation_reason TEXT,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_medications_patient_id ON medications(patient_id);
CREATE INDEX idx_medications_active ON medications(is_active);
CREATE INDEX idx_medications_category ON medications(category);
```

### 8. Medication Reminders Table
```sql
CREATE TABLE medication_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Reminder Schedule
  reminder_time TIME NOT NULL,            -- HH:MM format
  days_of_week INTEGER[] NOT NULL,        -- [1,2,3,4,5] for weekdays (1=Monday)
  
  -- Reminder Settings
  reminder_type ENUM('notification', 'sms', 'email', 'call') DEFAULT 'notification',
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Tracking
  last_taken TIMESTAMP,
  next_due TIMESTAMP,
  missed_doses INTEGER DEFAULT 0,
  total_doses INTEGER DEFAULT 0,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reminders_medication_id ON medication_reminders(medication_id);
CREATE INDEX idx_reminders_patient_id ON medication_reminders(patient_id);
CREATE INDEX idx_reminders_next_due ON medication_reminders(next_due);
```

### 9. Health Timeline Events Table
```sql
CREATE TABLE health_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Event Classification
  event_type ENUM('visit', 'lab', 'imaging', 'prescription', 'procedure', 'vaccination', 'emergency', 'milestone', 'symptom', 'vital') NOT NULL,
  category ENUM('preventive', 'diagnostic', 'treatment', 'emergency', 'routine', 'chronic_care', 'mental_health') NOT NULL,
  
  -- Event Details (Encrypted)
  encrypted_title TEXT NOT NULL,
  encrypted_description TEXT NOT NULL,
  
  -- Event Metadata
  event_date DATE NOT NULL,
  provider_id UUID REFERENCES providers(id),
  encrypted_provider_name TEXT,
  encrypted_location TEXT,
  
  -- Severity and Outcome
  severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  outcome ENUM('positive', 'negative', 'neutral', 'ongoing') DEFAULT 'neutral',
  
  -- Relationships
  related_event_ids UUID[],               -- Array of related event IDs
  parent_event_id UUID REFERENCES health_events(id),
  
  -- Cost Information (Encrypted)
  encrypted_cost_info TEXT,               -- JSON: {total, insurance, outOfPocket}
  
  -- Clinical Data (Encrypted)
  encrypted_vitals TEXT,                  -- JSON: vitals data
  encrypted_lab_results TEXT,             -- JSON: lab results
  
  -- Tags and Classification
  tags TEXT[],
  icd_10_codes TEXT[],
  cpt_codes TEXT[],
  
  -- Family Relevance
  family_relevant BOOLEAN DEFAULT FALSE,
  genetic_relevance BOOLEAN DEFAULT FALSE,
  
  -- Attachments
  attachment_ids UUID[],                  -- References to medical_attachments
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_health_events_patient_id ON health_events(patient_id);
CREATE INDEX idx_health_events_date ON health_events(event_date);
CREATE INDEX idx_health_events_type ON health_events(event_type);
CREATE INDEX idx_health_events_tags ON health_events USING GIN(tags);
```

### 10. Family Members Table
```sql
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  linked_user_id UUID REFERENCES users(id),    -- If family member has their own account
  
  -- Personal Information (Encrypted)
  encrypted_first_name TEXT NOT NULL,
  encrypted_last_name TEXT NOT NULL,
  encrypted_date_of_birth TEXT,
  
  -- Relationship
  relationship ENUM('spouse', 'child', 'parent', 'sibling', 'grandparent', 'other') NOT NULL,
  gender ENUM('male', 'female', 'other', 'prefer_not_to_say'),
  
  -- Contact Information (Encrypted)
  encrypted_contact_info TEXT,            -- JSON: {phone, email, address}
  
  -- Medical Information (Encrypted)
  encrypted_medical_info TEXT,            -- JSON: {allergies, medications, conditions, emergencyMedicalInfo}
  encrypted_blood_type TEXT,
  
  -- Insurance Information (Encrypted)
  encrypted_insurance_info TEXT,          -- JSON: {provider, policyNumber, groupNumber, isPrimary}
  
  -- Status and Permissions
  is_dependent BOOLEAN DEFAULT FALSE,
  is_emergency_contact BOOLEAN DEFAULT FALSE,
  account_status ENUM('active', 'pending', 'inactive') DEFAULT 'pending',
  
  -- Permissions (Encrypted)
  encrypted_permissions TEXT,             -- JSON: permission settings
  
  -- Profile
  avatar_url VARCHAR(500),
  last_active TIMESTAMP,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_family_members_patient_id ON family_members(patient_id);
CREATE INDEX idx_family_members_relationship ON family_members(relationship);
CREATE INDEX idx_family_members_linked_user ON family_members(linked_user_id);
```
### 11. Comprehensive Audit Trail
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Actor Information
  actor_user_id UUID NOT NULL REFERENCES users(id),
  actor_type ENUM('patient', 'provider', 'system', 'researcher', 'admin') NOT NULL,
  actor_ip_address INET NOT NULL,
  actor_user_agent TEXT,
  actor_organization VARCHAR(255),
  
  -- Action Details
  action ENUM('view', 'download', 'share', 'modify', 'delete', 'export', 'print', 'access_granted', 'access_denied', 'login', 'logout') NOT NULL,
  resource_type ENUM('medical_record', 'patient_profile', 'permission_setting', 'data_export', 'medication', 'health_event', 'family_member') NOT NULL,
  resource_id UUID NOT NULL,
  resource_name VARCHAR(255),
  
  -- Target Information (for actions involving multiple parties)
  target_user_id UUID REFERENCES users(id),
  target_type ENUM('patient', 'provider', 'system', 'researcher', 'admin'),
  
  -- Context and Details
  encrypted_details TEXT NOT NULL,        -- JSON with action-specific details
  method ENUM('web', 'api', 'mobile', 'integration') NOT NULL,
  session_id VARCHAR(128),
  request_id VARCHAR(128),
  
  -- Location and Duration
  location_country VARCHAR(2),
  location_region VARCHAR(100),
  duration_seconds INTEGER,
  data_size_bytes BIGINT,
  
  -- Outcome and Risk Assessment
  outcome ENUM('success', 'failure', 'partial', 'blocked') NOT NULL,
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  compliance_flags TEXT[],                -- Array of compliance-related flags
  
  -- Reason and Purpose
  encrypted_reason TEXT,                  -- Why the action was performed
  encrypted_purpose TEXT,                 -- Business purpose
  
  -- Timestamps
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Partitioning by month for performance
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_outcome ON audit_logs(outcome);
```

### 12. Data Sharing and Monetization
```sql
CREATE TABLE data_sharing_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Recipient Information
  recipient_type ENUM('researcher', 'pharmaceutical', 'insurance', 'government', 'academic') NOT NULL,
  recipient_organization VARCHAR(255) NOT NULL,
  recipient_contact_info TEXT,
  
  -- Agreement Details (Encrypted)
  encrypted_purpose TEXT NOT NULL,
  encrypted_data_types TEXT NOT NULL,     -- JSON array of data types shared
  encrypted_compensation_terms TEXT,      -- JSON: compensation details
  
  -- Scope and Limitations
  data_anonymization_level ENUM('none', 'basic', 'advanced', 'full') DEFAULT 'basic',
  geographic_restrictions TEXT[],         -- Array of allowed regions
  usage_restrictions TEXT[],              -- Array of usage limitations
  
  -- Timeline
  effective_date DATE NOT NULL,
  expiration_date DATE,
  auto_renewal BOOLEAN DEFAULT FALSE,
  
  -- Status
  status ENUM('draft', 'active', 'suspended', 'terminated', 'expired') DEFAULT 'draft',
  signed_at TIMESTAMP,
  
  -- Financial Terms (Encrypted)
  encrypted_payment_terms TEXT,           -- JSON: payment structure
  total_compensation_usd DECIMAL(10,2),
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_data_sharing_patient_id ON data_sharing_agreements(patient_id);
CREATE INDEX idx_data_sharing_status ON data_sharing_agreements(status);
```

### 13. Provider Access Requests
```sql
CREATE TABLE provider_access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Request Details (Encrypted)
  encrypted_purpose TEXT NOT NULL,
  encrypted_justification TEXT NOT NULL,
  requested_permissions JSONB NOT NULL,   -- Structured permission request
  
  -- Request Metadata
  urgency ENUM('low', 'medium', 'high', 'emergency') DEFAULT 'medium',
  expected_duration_days INTEGER,
  
  -- Status and Response
  status ENUM('pending', 'approved', 'denied', 'expired', 'withdrawn') DEFAULT 'pending',
  patient_response TEXT,
  response_date TIMESTAMP,
  
  -- Expiration
  expires_at TIMESTAMP NOT NULL,
  
  -- Audit Fields
  requested_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_access_requests_provider_id ON provider_access_requests(provider_id);
CREATE INDEX idx_access_requests_patient_id ON provider_access_requests(patient_id);
CREATE INDEX idx_access_requests_status ON provider_access_requests(status);
```

## Core Backend Functions (Pseudocode)

### Wallet Integration and Storage Functions
```typescript
// User Registration with Ethereum Wallet
async function registerUser(walletAddress: string, walletType: string): Promise<UserIdentity> {
  // Verify wallet ownership with signature
  const message = `Register MediVet account: ${Date.now()}`;
  const signature = await signMessage(message, walletAddress);
  
  if (!verifySignature(message, signature, walletAddress)) {
    throw new Error('Invalid wallet signature');
  }
  
  // Generate encryption key pair
  const { publicKey, privateKey } = generateEncryptionKeys();
  
  // Store user identity
  const userIdentity = await createUserIdentity({
    walletAddress,
    walletType,
    encryptionPublicKey: publicKey,
    isActive: true
  });
  
  return userIdentity;
}

// Data Encryption and Filecoin Upload
async function encryptAndUploadToFilecoin(data: any, patientWalletAddress: string): Promise<FilecoinUploadResult> {
  // Get patient's encryption public key
  const patient = await getUserByWallet(patientWalletAddress);
  
  // Encrypt data
  const encryptedData = await encryptData(data, patient.encryptionPublicKey);
  
  // Upload to Filecoin
  const uploadResult = await uploadToFilecoin(encryptedData);
  
  // Create storage deal
  const storageDeal = await createStorageDeal({
    cid: uploadResult.cid,
    dealId: uploadResult.dealId,
    minerAddress: uploadResult.minerAddress,
    dataSize: encryptedData.size,
    duration: 525600, // 1 year in epochs
    price: uploadResult.price
  });
  
  return {
    cid: uploadResult.cid,
    dealId: uploadResult.dealId,
    encryptionKeyHash: hashEncryptionKey(patient.encryptionPublicKey)
  };
}

// Data Retrieval and Decryption with Permission Check
async function retrieveAndDecryptFromFilecoin(
  cid: string,
  requestorWalletAddress: string,
  patientWalletAddress: string,
  dataType: string
): Promise<any> {
  // Verify permissions via smart contract
  const hasPermission = await checkSmartContractPermission(
    requestorWalletAddress, 
    patientWalletAddress, 
    dataType
  );
  
  if (!hasPermission) {
    await logAuditEvent('access_denied', requestorWalletAddress, 'permission_denied');
    throw new Error('Access denied');
  }
  
  // Retrieve from Filecoin
  const encryptedData = await retrieveFromFilecoin(cid);
  
  // Get requestor's private key (from secure key management)
  const requestorPrivateKey = await getPrivateKey(requestorWalletAddress);
  
  // Decrypt data
  const decryptedData = await decryptData(encryptedData, requestorPrivateKey);
  
  // Log access on blockchain
  await logBlockchainAuditEvent('view', requestorWalletAddress, 'data_accessed', {
    patientWallet: patientWalletAddress,
    dataType,
    cid
  });
  
  return decryptedData;
}
```

### Smart Contract Permission Management
```typescript
// Grant Provider Access via Smart Contract
async function grantProviderAccessOnChain(
  patientWalletAddress: string,
  providerWalletAddress: string,
  permissions: PermissionSet,
  expirationDate?: Date
): Promise<string> {
  // Prepare smart contract transaction
  const contract = getPermissionContract();
  
  // Encrypt permissions
  const patient = await getUserByWallet(patientWalletAddress);
  const encryptedPermissions = await encryptData(permissions, patient.encryptionPublicKey);
  
  // Execute smart contract transaction
  const tx = await contract.grantAccess(
    providerWalletAddress,
    encryptedPermissions,
    expirationDate ? Math.floor(expirationDate.getTime() / 1000) : 0
  );
  
  // Wait for confirmation
  const receipt = await tx.wait();
  
  // Store permission record in database
  await createPermissionRecord({
    patientId: patient.id,
    providerId: (await getUserByWallet(providerWalletAddress)).id,
    contractAddress: contract.address,
    transactionHash: receipt.transactionHash,
    blockNumber: receipt.blockNumber,
    encryptedPermissions,
    grantedBy: patient.id
  });
  
  return receipt.transactionHash;
}

// Check Permission via Smart Contract
async function checkSmartContractPermission(
  requestorWallet: string,
  patientWallet: string,
  dataType: string,
  action: 'read' | 'write' = 'read'
): Promise<boolean> {
  const contract = getPermissionContract();
  
  // Query smart contract for permission
  const hasPermission = await contract.hasPermission(
    requestorWallet,
    patientWallet,
    dataType,
    action
  );
  
  if (!hasPermission) {
    return false;
  }
  
  // Check expiration on-chain
  const expirationTime = await contract.getPermissionExpiration(
    requestorWallet,
    patientWallet
  );
  
  if (expirationTime > 0 && expirationTime < Math.floor(Date.now() / 1000)) {
    return false;
  }
  
  return true;
}

// Emergency Override with Blockchain Logging
async function emergencyOverrideOnChain(
  providerWallet: string,
  patientWallet: string,
  justification: string
): Promise<TemporaryAccess> {
  // Verify provider credentials
  const provider = await getUserByWallet(providerWallet);
  if (!provider || provider.userType !== 'provider') {
    throw new Error('Invalid provider');
  }
  
  // Check patient's emergency override settings
  const patient = await getUserByWallet(patientWallet);
  if (!patient.allowEmergencyOverride) {
    throw new Error('Patient has disabled emergency override');
  }
  
  // Execute emergency access smart contract
  const contract = getEmergencyContract();
  const tx = await contract.emergencyAccess(
    patientWallet,
    justification,
    24 * 60 * 60 // 24 hours in seconds
  );
  
  const receipt = await tx.wait();
  
  // Create temporary access record
  const temporaryAccess = await createTemporaryAccess({
    providerId: provider.id,
    patientId: patient.id,
    justification,
    transactionHash: receipt.transactionHash,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    accessLevel: 'emergency_full'
  });
  
  return temporaryAccess;
}
```
### Medical Record Management Functions
```typescript
// Create Medical Record with Filecoin Storage
async function createMedicalRecord(
  patientWalletAddress: string,
  recordData: MedicalRecordInput,
  createdByWallet: string
): Promise<MedicalRecord> {
  // Validate input
  validateMedicalRecordInput(recordData);
  
  // Encrypt and upload to Filecoin
  const uploadResult = await encryptAndUploadToFilecoin(recordData, patientWalletAddress);
  
  // Get patient and creator info
  const patient = await getUserByWallet(patientWalletAddress);
  const creator = await getUserByWallet(createdByWallet);
  
  // Create record with Filecoin references
  const medicalRecord = {
    id: generateUUID(),
    patientId: patient.id,
    recordType: recordData.type,
    category: recordData.category,
    filecoinCid: uploadResult.cid,
    filecoinDealId: uploadResult.dealId,
    storageMiner: uploadResult.minerAddress,
    encryptionKeyHash: uploadResult.encryptionKeyHash,
    recordDate: recordData.date,
    providerId: recordData.providerId,
    sensitivityLevel: recordData.sensitivityLevel || 'medium',
    isSensitive: recordData.sensitive || false,
    tags: recordData.tags || [],
    icd10Codes: recordData.icd10Codes || [],
    cptCodes: recordData.cptCodes || [],
    familyRelevant: recordData.familyRelevant || false,
    createdBy: creator.id,
    createdAt: new Date()
  };
  
  // Store record metadata in database
  const savedRecord = await saveToDatabase('medical_records', medicalRecord);
  
  // Log creation on blockchain
  await logBlockchainAuditEvent('create', createdByWallet, 'medical_record_created', {
    recordId: savedRecord.id,
    patientWallet: patientWalletAddress,
    recordType: recordData.type,
    filecoinCid: uploadResult.cid
  });
  
  return savedRecord;
}

// Retrieve Medical Records with Filecoin Integration
async function getMedicalRecords(
  patientWalletAddress: string,
  requestorWalletAddress: string,
  filters?: RecordFilters
): Promise<MedicalRecord[]> {
  // Check permission via smart contract
  const hasPermission = await checkSmartContractPermission(
    requestorWalletAddress, 
    patientWalletAddress, 
    'medical_history', 
    'read'
  );
  
  if (!hasPermission) {
    throw new Error('Access denied to medical records');
  }
  
  // Get patient info
  const patient = await getUserByWallet(patientWalletAddress);
  
  // Get record metadata from database
  const recordMetadata = await queryDatabase('medical_records', {
    patientId: patient.id,
    deletedAt: null,
    ...filters
  });
  
  // Retrieve and decrypt records from Filecoin
  const decryptedRecords = await Promise.all(
    recordMetadata.map(async (record) => {
      const decryptedData = await retrieveAndDecryptFromFilecoin(
        record.filecoinCid,
        requestorWalletAddress,
        patientWalletAddress,
        'medical_history'
      );
      
      return {
        ...record,
        ...decryptedData
      };
    })
  );
  
  return decryptedRecords;
}

// Share Medical Record via Smart Contract
async function shareMedicalRecordOnChain(
  recordId: string,
  patientWalletAddress: string,
  providerWalletAddress: string,
  sharedByWallet: string
): Promise<string> {
  // Verify record ownership
  const record = await getMedicalRecord(recordId);
  const patient = await getUserByWallet(patientWalletAddress);
  
  if (record.patientId !== patient.id) {
    throw new Error('Record does not belong to patient');
  }
  
  // Execute smart contract for sharing
  const contract = getRecordSharingContract();
  const tx = await contract.shareRecord(
    recordId,
    patientWalletAddress,
    providerWalletAddress,
    record.filecoinCid
  );
  
  const receipt = await tx.wait();
  
  // Update database
  const provider = await getUserByWallet(providerWalletAddress);
  await updateDatabase('medical_records', recordId, {
    sharedWithProviderIds: [...record.sharedWithProviderIds, provider.id],
    updatedAt: new Date()
  });
  
  return receipt.transactionHash;
}
```

## API Endpoints Structure

### Authentication & Authorization
```typescript
// JWT Token with Wallet Address
interface AuthToken {
  walletAddress: string;
  userType: 'patient' | 'provider' | 'admin';
  encryptionPublicKey: string;
  permissions: string[];
  iat: number;
  exp: number;
}

// Middleware for API Authentication
async function authenticateRequest(req: Request): Promise<AuthContext> {
  const token = extractBearerToken(req.headers.authorization);
  const decoded = verifyJWT(token);
  
  // Verify wallet signature for additional security
  const signature = req.headers['x-wallet-signature'];
  const message = req.headers['x-signed-message'];
  
  if (!verifySignature(message, signature, decoded.walletAddress)) {
    throw new Error('Invalid wallet signature');
  }
  
  // Verify user is still active
  const user = await getUserByWallet(decoded.walletAddress);
  if (!user || !user.isActive) {
    throw new Error('User account inactive');
  }
  
  // Check for suspicious activity
  await checkForSuspiciousActivity(decoded.walletAddress, req.ip);
  
  return {
    walletAddress: decoded.walletAddress,
    userType: decoded.userType,
    encryptionPublicKey: decoded.encryptionPublicKey,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  };
}
```

### Core API Endpoints
```typescript
// Patient Endpoints
POST   /api/v1/patients/connect-wallet
POST   /api/v1/patients/register
POST   /api/v1/patients/login
GET    /api/v1/patients/profile
PUT    /api/v1/patients/profile
DELETE /api/v1/patients/account

// Medical Records with Filecoin
GET    /api/v1/patients/{walletAddress}/records
POST   /api/v1/patients/{walletAddress}/records
GET    /api/v1/patients/{walletAddress}/records/{recordId}
PUT    /api/v1/patients/{walletAddress}/records/{recordId}
DELETE /api/v1/patients/{walletAddress}/records/{recordId}
POST   /api/v1/patients/{walletAddress}/records/{recordId}/share
POST   /api/v1/patients/{walletAddress}/records/{recordId}/attachments

// Smart Contract Permissions
GET    /api/v1/patients/{walletAddress}/permissions
POST   /api/v1/patients/{walletAddress}/permissions/grant
PUT    /api/v1/patients/{walletAddress}/permissions/{providerWallet}
DELETE /api/v1/patients/{walletAddress}/permissions/{providerWallet}
GET    /api/v1/patients/{walletAddress}/permissions/contracts

// Provider Endpoints
POST   /api/v1/providers/connect-wallet
POST   /api/v1/providers/register
GET    /api/v1/providers/patients
GET    /api/v1/providers/patients/{walletAddress}/records
POST   /api/v1/providers/access-requests
GET    /api/v1/providers/access-requests
POST   /api/v1/providers/emergency-access

// Filecoin Storage
GET    /api/v1/storage/deals
POST   /api/v1/storage/upload
GET    /api/v1/storage/retrieve/{cid}
GET    /api/v1/storage/status/{dealId}

// Blockchain Integration
GET    /api/v1/blockchain/transactions/{hash}
POST   /api/v1/blockchain/verify-signature
GET    /api/v1/blockchain/audit-logs/{walletAddress}

// Medications
GET    /api/v1/patients/{walletAddress}/medications
POST   /api/v1/patients/{walletAddress}/medications
PUT    /api/v1/patients/{walletAddress}/medications/{medicationId}
DELETE /api/v1/patients/{walletAddress}/medications/{medicationId}

// Health Timeline
GET    /api/v1/patients/{walletAddress}/timeline
POST   /api/v1/patients/{walletAddress}/timeline/events

// Family Health
GET    /api/v1/patients/{walletAddress}/family
POST   /api/v1/patients/{walletAddress}/family/members

// Audit and Compliance
GET    /api/v1/patients/{walletAddress}/audit-logs
GET    /api/v1/patients/{walletAddress}/data-access-report
POST   /api/v1/patients/{walletAddress}/data-export
GET    /api/v1/patients/{walletAddress}/compliance-report
```

## Data Validation and Security

### Input Validation Functions
```typescript
// Medical Record Validation
function validateMedicalRecordInput(data: MedicalRecordInput): void {
  const schema = {
    type: { required: true, enum: ['lab', 'imaging', 'prescription', 'visit', 'vital', 'allergy'] },
    title: { required: true, maxLength: 255, sanitize: true },
    description: { required: true, maxLength: 5000, sanitize: true },
    date: { required: true, type: 'date', maxDate: new Date() },
    sensitivityLevel: { enum: ['low', 'medium', 'high', 'critical'] },
    tags: { type: 'array', maxItems: 20, itemMaxLength: 50 }
  };
  
  validateAgainstSchema(data, schema);
}

// Permission Validation
function validatePermissionGrant(permissions: PermissionSet): void {
  const allowedPermissions = [
    'basic_info', 'medical_history', 'lab_results', 'imaging',
    'prescriptions', 'vitals', 'allergies', 'emergency_contact',
    'mental_health', 'genetic_data', 'insurance_info'
  ];
  
  for (const [key, value] of Object.entries(permissions)) {
    if (!allowedPermissions.includes(key)) {
      throw new Error(`Invalid permission: ${key}`);
    }
    
    if (typeof value !== 'object' || !('read' in value) || !('write' in value)) {
      throw new Error(`Invalid permission structure for: ${key}`);
    }
  }
}

// Rate Limiting
async function checkRateLimit(userId: string, endpoint: string): Promise<void> {
  const key = `rate_limit:${userId}:${endpoint}`;
  const current = await redis.get(key);
  
  if (current && parseInt(current) > getRateLimit(endpoint)) {
    throw new Error('Rate limit exceeded');
  }
  
  await redis.incr(key);
  await redis.expire(key, 3600); // 1 hour window
}

// Suspicious Activity Detection
async function checkForSuspiciousActivity(userId: string, ipAddress: string): Promise<void> {
  const recentLogins = await getRecentLogins(userId, 24); // Last 24 hours
  
  // Check for multiple IP addresses
  const uniqueIPs = new Set(recentLogins.map(login => login.ipAddress));
  if (uniqueIPs.size > 5) {
    await flagSuspiciousActivity(userId, 'multiple_ip_addresses');
  }
  
  // Check for unusual access patterns
  const accessPattern = await analyzeAccessPattern(userId);
  if (accessPattern.riskScore > 80) {
    await flagSuspiciousActivity(userId, 'unusual_access_pattern');
  }
}
```

## Security Measures

### Encryption at Rest and in Transit
```typescript
// Database Encryption Configuration
const dbConfig = {
  encryption: {
    algorithm: 'AES-256-GCM',
    keyRotationInterval: '90d',
    encryptionAtRest: true,
    transparentDataEncryption: true
  },
  ssl: {
    enabled: true,
    certificateValidation: true,
    minTlsVersion: '1.3'
  }
};

// API Security Headers
const securityHeaders = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

// Key Management
async function rotateEncryptionKeys(): Promise<void> {
  const usersToRotate = await getUsersWithExpiringKeys();
  
  for (const user of usersToRotate) {
    const { oldKey, newKey } = await rotateUserKeys(user.id);
    
    // Re-encrypt all user data with new key
    await reEncryptUserData(user.id, oldKey, newKey);
    
    // Update key rotation history
    await logKeyRotation(user.id, oldKey, newKey, 'scheduled');
  }
}
```

## Compliance and Monitoring

### HIPAA Compliance Functions
```typescript
// Business Associate Agreement Tracking
async function trackBAA(organizationId: string, baaDetails: BAADetails): Promise<void> {
  await saveToDatabase('business_associate_agreements', {
    organizationId,
    signedDate: baaDetails.signedDate,
    expirationDate: baaDetails.expirationDate,
    complianceRequirements: baaDetails.requirements,
    status: 'active'
  });
}

// Breach Detection and Notification
async function detectAndReportBreach(incident: SecurityIncident): Promise<void> {
  const riskAssessment = await assessBreachRisk(incident);
  
  if (riskAssessment.requiresNotification) {
    // Notify affected patients within 60 days
    await notifyAffectedPatients(incident.affectedUserIds);
    
    // Report to HHS within 60 days
    await reportToHHS(incident, riskAssessment);
    
    // Notify media if > 500 individuals affected
    if (incident.affectedUserIds.length > 500) {
      await notifyMedia(incident);
    }
  }
}

// Data Retention and Disposal
async function enforceDataRetention(): Promise<void> {
  const retentionPolicies = await getDataRetentionPolicies();
  
  for (const policy of retentionPolicies) {
    const expiredData = await findExpiredData(policy);
    
    for (const data of expiredData) {
      // Secure deletion with multiple overwrites
      await secureDelete(data.id);
      
      // Log disposal
      await logAuditEvent('delete', 'system', 'data_disposed', {
        dataId: data.id,
        retentionPolicy: policy.name,
        disposalMethod: 'secure_overwrite'
      });
    }
  }
}
```

This comprehensive backend architecture provides:

1. **Identity-Based Encryption** with unique public keys per user
2. **Granular Permissions** at the field level with patient control
3. **Comprehensive Audit Trail** for all actions
4. **HIPAA Compliance** with proper security measures
5. **Scalable Database Schema** with proper indexing
6. **Secure API Design** with authentication and rate limiting
7. **Data Validation** and input sanitization
8. **Emergency Access** capabilities with proper logging
9. **Family Health Management** with privacy controls
10. **Medication Management** with reminders and interactions

The system ensures patients maintain full control over their health data while enabling secure, auditable access for authorized healthcare providers.
