/**
 * HMRC Client Data Integration - Google Sheets Implementation
 * 
 * Connects to Google Sheets containing HMRC client data for the Auto-Call System.
 * Provides database abstraction layer for easy migration to other systems (SQLite, PostgreSQL, SuiteCRM).
 * 
 * @author Brigain's Assistant
 * @version 1.0.0
 * @date 2025-12-09
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/** HMRC Department identifiers */
export type HMRC_Department = 
  | 'corporation_tax'
  | 'paye'
  | 'vat'
  | 'self_assessment';

/** Client type classification */
export type ClientType = 'COMPANY' | 'INDIVIDUAL' | 'CHARITY';

/** Main client data structure */
export interface HMRCClient {
  id: string;                           // Unique identifier (row-based or UUID)
  clientType: ClientType;
  
  // Names
  companyName?: string;                // For companies/charities
  firstName?: string;                  // For individuals
  lastName?: string;                   // For individuals
  
  // HMRC Reference Numbers
  vatNumber?: string;                  // VAT Registration (GB + 9 digits)
  utr?: string;                        // Unique Taxpayer Reference
  payeRef?: string;                    // PAYE Reference
  
  // Contact Information
  email: string;
  phone: string;
  
  // Address (flattened from sheet structure)
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postcode: string;
  
  // Department Mappings (which departments to call for this client)
  departments: {
    corporationTax: boolean;
    paye: boolean;
    vat: boolean;
    selfAssessment: boolean;
  };
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

/** Security questions per department */
export interface SecurityQuestions {
  clientId: string;
  department: HMRC_Department;
  
  // Corporation Tax Security Data
  corporationTaxSecurity?: {
    udrNumber?: string;              // Unique Dealer Reference
    lastFiledYear?: string;          // e.g., "2024"
    companyType?: string;            // Ltd, PLC, Charity
  };
  
  // PAYE Security Data  
  payeSecurity?: {
    numberOfEmployees: number;
    lastPayRunDate: string;          // ISO date format
    payrollSoftwareUsed: string;
  };
  
  // VAT Security Data
  vatSecurity?: {
    vatPeriodEnding: string;         // Last period end date (ISO)
    returnFrequency: 'monthly' | 'quarterly' | 'annually';
    accountingMethod: 'cash' | 'accruals';
  };
  
  // Self Assessment Security Data
  selfAssessmentSecurity?: {
    dateOfBirth: string;             // ISO date format
    nino: string;                    // National Insurance Number
  };
}

/** Call log for audit trail */
export interface CallLog {
  id: string;                          // UUID
  clientId: string;                    // Reference to client
  
  // Call Details
  department: HMRC_Department;
  callDate: Date;
  callDuration?: number;               // Seconds
  hmrcContactRef?: string;             // Reference from HMRC
  
  // Outcome
  status: 'SUCCESSFUL' | 'PENDING' | 'FAILED' | 'TRANSFERRED';
  subject: string;
  notes: string;
  
  // Authentication
  securityQuestionsAnswered: string[];
  authenticationSuccessful: boolean;
}

/** HMRC Department configuration */
export interface HMRCDepartmentConfig {
  id: HMRC_Department;
  name: string;
  phoneNumber: string;
  requiredSecurityFields: string[];
  openingHours: string;
  typicalWaitTimeMinutes: number;
}

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

/** Google Sheets configuration */
interface GoogleSheetsConfig {
  spreadsheetId: string;
  sheetMappings: {
    companies: { name: string; gid: string };
    individuals: { name: string; gid: string };
    callLogs: { name: string; gid: string };
  };
}

/** HMRC Department phone numbers and configurations */
export const HMRC_DEPARTMENTS: Record<HMRC_Department, HMRCDepartmentConfig> = {
  corporation_tax: {
    id: 'corporation_tax',
    name: 'Corporation Tax',
    phoneNumber: '0345 050 1007',
    requiredSecurityFields: ['udr_number', 'company_type'],
    openingHours: 'Monday to Friday, 8am to 6pm GMT/BST',
    typicalWaitTimeMinutes: 25
  },
  
  paye: {
    id: 'paye',
    name: 'PAYE/Business Enquiry Service',
    phoneNumber: '0345 300 0541',
    requiredSecurityFields: ['paye_reference', 'employer_id'],
    openingHours: 'Monday to Friday, 8am to 6pm GMT/BST',
    typicalWaitTimeMinutes: 20
  },
  
  vat: {
    id: 'vat',
    name: 'VAT Helpline',
    phoneNumber: '0345 302 1489',
    requiredSecurityFields: ['vat_number', 'last_filing_period'],
    openingHours: 'Monday to Friday, 8am to 6pm GMT/BST',
    typicalWaitTimeMinutes: 18
  },
  
  self_assessment: {
    id: 'self_assessment',
    name: 'Self Assessment Helpline',
    phoneNumber: '0345 300 0525',
    requiredSecurityFields: ['utr', 'date_of_birth', 'nino'],
    openingHours: 'Monday to Friday, 8am to 6pm GMT/BST',
    typicalWaitTimeMinutes: 30
  }
};

/** Default Google Sheets configuration */
const DEFAULT_SHEET_CONFIG: GoogleSheetsConfig = {
  spreadsheetId: '1v-1SkHzSMdpHyxMqQluDo7_--sj69cUH9SXCtuqLENQ',
  sheetMappings: {
    companies: { name: 'Limited Companies/Charities', gid: '1071736773' },
    individuals: { name: "People & SA", gid: '' }, // gid to be discovered
    callLogs: { name: 'Call Logs', gid: '' }        // Will be created if needed
  }
};

// ============================================================================
// GOOGLE SHEETS DATA ACCESS CLASS
// ============================================================================

/**
 * Main class for accessing HMRC client data from Google Sheets.
 * Implements repository pattern for easy migration to other backends.
 */
export class HMRCDataRepository {
  private config: GoogleSheetsConfig;
  private apiKey: string;
  private googleSheetsUrl: string;
  
  constructor(config?: Partial<GoogleSheetsConfig>, apiKey?: string) {
    this.config = { ...DEFAULT_SHEET_CONFIG, ...config };
    this.apiKey = apiKey || process.env.GOOGLE_SHEETS_API_KEY || '';
    this.googleSheetsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${this.config.spreadsheetId}`;
  }

  // ==========================================================================
  // CLIENT OPERATIONS
  // ==========================================================================

  /**
   * Get client by unique ID (or email/UTR/VAT as fallback)
   */
  async getClientData(identifier: string): Promise<HMRCClient | null> {
    try {
      // Try to fetch from companies sheet first
      const companiesData = await this.fetchSheet('companies');
      const companyMatch = this.findClientInArray(companiesData, identifier);
      
      if (companyMatch) {
        return this.parseCompanyClient(companyMatch);
      }
      
      // Try individuals sheet
      const individualsData = await this.fetchSheet('individuals');
      const individualMatch = this.findClientInArray(individualsData, identifier);
      
      if (individualMatch) {
        return this.parseIndividualClient(individualMatch);
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching client data:', error);
      throw new Error(`Failed to fetch client data: ${error}`);
    }
  }

  /**
   * Search clients by query string (email, name, VAT number, UTR)
   */
  async searchClients(query: string): Promise<HMRCClient[]> {
    try {
      const lowerQuery = query.toLowerCase();
      const results: HMRCClient[] = [];
      
      // Search companies
      const companiesData = await this.fetchSheet('companies');
      for (const row of companiesData) {
        if (this.clientMatchesQuery(row, lowerQuery)) {
          try {
            results.push(this.parseCompanyClient(row));
          } catch (e) {
            // Skip malformed rows
          }
        }
      }
      
      // Search individuals
      const individualsData = await this.fetchSheet('individuals');
      for (const row of individualsData) {
        if (this.clientMatchesQuery(row, lowerQuery)) {
          try {
            results.push(this.parseIndividualClient(row));
          } catch (e) {
            // Skip malformed rows
          }
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error searching clients:', error);
      throw new Error(`Failed to search clients: ${error}`);
    }
  }

  /**
   * Get all active clients (paginated if needed)
   */
  async getAllClients(clientType?: ClientType): Promise<HMRCClient[]> {
    try {
      const clients: HMRCClient[] = [];
      
      if (!clientType || clientType === 'COMPANY' || clientType === 'CHARITY') {
        const companiesData = await this.fetchSheet('companies');
        for (const row of companiesData) {
          try {
            clients.push(this.parseCompanyClient(row));
          } catch (e) { /* skip invalid */ }
        }
      }
      
      if (!clientType || clientType === 'INDIVIDUAL') {
        const individualsData = await this.fetchSheet('individuals');
        for (const row of individualsData) {
          try {
            clients.push(this.parseIndividualClient(row));
          } catch (e) { /* skip invalid */ }
        }
      }
      
      return clients;
    } catch (error) {
      console.error('Error fetching all clients:', error);
      throw new Error(`Failed to fetch all clients: ${error}`);
    }
  }

  // ==========================================================================
  // SECURITY QUESTIONS OPERATIONS
  // ==========================================================================

  /**
   * Get security questions and answers for a client/department combination
   */
  async getSecurityQuestions(
    clientId: string, 
    department: HMRC_Department
  ): Promise<SecurityQuestions | null> {
    try {
      const client = await this.getClientData(clientId);
      if (!client) return null;
      
      // Build security data based on department
      const securityData: Partial<SecurityQuestions> = {
        clientId,
        department
      };
      
      switch (department) {
        case 'corporation_tax':
          securityData.corporationTaxSecurity = {
            udrNumber: this.getSheetValueFromClient(client, 'udr_number'),
            lastFiledYear: this.getSheetValueFromClient(client, 'last_filed_year'),
            companyType: client.clientType
          };
          break;
          
        case 'paye':
          securityData.payeSecurity = {
            numberOfEmployees: parseInt(this.getSheetValueFromClient(client, 'employee_count')) || 0,
            lastPayRunDate: this.getSheetValueFromClient(client, 'last_pay_run_date') || new Date().toISOString(),
            payrollSoftwareUsed: this.getSheetValueFromClient(client, 'payroll_software') || 'Unknown'
          };
          break;
          
        case 'vat':
          securityData.vatSecurity = {
            vatPeriodEnding: this.getSheetValueFromClient(client, 'last_vat_period_end'),
            returnFrequency: (this.getSheetValueFromClient(client, 'vat_frequency') as any) || 'quarterly',
            accountingMethod: (this.getSheetValueFromClient(client, 'accounting_method') as any) || 'accruals'
          };
          break;
          
        case 'self_assessment':
          securityData.selfAssessmentSecurity = {
            dateOfBirth: this.getSheetValueFromClient(client, 'date_of_birth'),
            nino: this.getSheetValueFromClient(client, 'nino')
          };
          break;
      }
      
      return securityData as SecurityQuestions;
    } catch (error) {
      console.error('Error fetching security questions:', error);
      throw new Error(`Failed to fetch security questions: ${error}`);
    }
  }

  /**
   * Get all required security question types for a department (for validation)
   */
  getRequiredSecurityFields(department: HMRC_Department): string[] {
    return HMRC_DEPARTMENTS[department].requiredSecurityFields;
  }

  // ==========================================================================
  // CALL LOG OPERATIONS
  // ==========================================================================

  /**
   * Log a call for audit trail
   */
  async logCall(
    clientId: string,
    department: HMRC_Department,
    data: Omit<CallLog, 'id' | 'clientId' | 'department' | 'callDate'>
  ): Promise<CallLog> {
    try {
      const callLog: CallLog = {
        id: this.generateUUID(),
        clientId,
        department,
        callDate: new Date(),
        ...data
      };
      
      // TODO: Implement write to Google Sheets (requires authenticated API)
      // For now, store in memory or log file
      console.log('Call logged:', JSON.stringify(callLog, null, 2));
      
      // Alternative: Append to a local JSONL file for persistence
      await this.writeCallLogToFile(callLog);
      
      return callLog;
    } catch (error) {
      console.error('Error logging call:', error);
      throw new Error(`Failed to log call: ${error}`);
    }
  }

  /**
   * Get call history for a client
   */
  async getCallHistory(clientId: string, limit: number = 10): Promise<CallLog[]> {
    try {
      // Read from local JSONL file (since Google Sheets write not available yet)
      const logs = await this.readCallLogsFromFile();
      return logs
        .filter(log => log.clientId === clientId)
        .sort((a, b) => new Date(b.callDate).getTime() - new Date(a.callDate).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching call history:', error);
      throw new Error(`Failed to fetch call history: ${error}`);
    }
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  /** Fetch sheet data from Google Sheets API */
  private async fetchSheet(sheetKey: keyof GoogleSheetsConfig['sheetMappings']): Promise<any[]> {
    const sheet = this.config.sheetMappings[sheetKey];
    const range = sheet.gid ? `gid=${sheet.gid}` : sheet.name;
    
    const url = `${this.googleSheetsUrl}/values/${range}?key=${this.apiKey}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const rows = data.values || [];
      
      // Skip header row (first row) and filter out empty rows
      return rows.slice(1).filter(row => row && row.length > 0 && row.some(cell => cell !== undefined && cell !== null && cell !== ''));
    } catch (error: any) {
      // Return mock data for development if API fails
      console.warn('Google Sheets fetch failed, using mock data:', error.message);
      return this.getMockData(sheetKey);
    }
  }

  /** Find client in array by various identifiers */
  private findClientInArray(data: any[], identifier: string): any | null {
    const lowerId = identifier.toLowerCase();
    
    for (const row of data) {
      if (!row || row.length === 0) continue;
      
      // Match against Company Reg (col A) or Company Name (col B)
      if (row[0] && String(row[0]).toLowerCase() === lowerId) return row;
      if (row[1] && String(row[1]).toLowerCase() === lowerId) return row;
      
      // Fallback: check email (col C), VAT (col E), UTR (col F)
      if (row[2] && String(row[2]).toLowerCase().includes(lowerId)) return row;
      if (row[4] && String(row[4]).toLowerCase().includes(lowerId)) return row;
      if (row[5] && String(row[5]).toLowerCase().includes(lowerId)) return row;
    }
    return null;
  }

  /** Check if client matches search query */
  private clientMatchesQuery(row: any[], query: string): boolean {
    if (!row || row.length === 0) return false;
    
    // Search Company Reg (A), Company Name (B), Email (C), Phone (D), VAT (E), UTR (F), PAYE (G)
    const searchableFields = [row[0], row[1], row[2], row[3], row[4], row[5], row[6]];
    
    return searchableFields.some(field => 
      field && String(field).toLowerCase().includes(query)
    );
  }

  /** Parse company row into HMRCClient */
  private parseCompanyClient(row: any[]): HMRCClient {
    // Google Sheets column mapping (0-indexed):
    // A=Company Reg Number, B=Company Name, C=Email, D=Phone, E=VAT, F=UTR, G=PAYE, H=Address1, I=City, J=Postcode
    
    return {
      id: row[0]?.toString() || this.generateUUID(), // Company Reg Number (col A)
      clientType: 'COMPANY',
      companyName: row[1] || '',                     // Company Name (col B)
      email: row[2] || '',                           // Email (col C)
      phone: row[3] || '',                           // Phone (col D)
      vatNumber: row[4]?.toString()?.replace(/GB/i, '').length === 9 ? `GB${row[4].toString()}` : undefined, // VAT (col E)
      utr: row[5]?.toString(),                        // UTR (col F)
      payeRef: row[6]?.toString(),                    // PAYE (col G)
      addressLine1: row[7] || '',                    // Address1 (col H)
      city: row[8] || '',                            // City (col I)
      postcode: row[9] || '',                        // Postcode (col J)
      departments: {
        corporationTax: !!row[5], // Has UTR = Corporation Tax applicable
        paye: !!row[6],          // Has PAYE ref = PAYE applicable
        vat: !!row[4],           // Has VAT number
        selfAssessment: false    // Companies don't file SA
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };
  }

  /** Parse individual row into HMRCClient */
  private parseIndividualClient(row: any[]): HMRCClient {
    // Column mapping for individuals
    // Example: [A=FirstName, B=LastName, C=Email, D=Phone, E=UTR, F=NINO, G=DOB]
    
    return {
      id: row[0]?.toString() + row[1]?.toString() || this.generateUUID(),
      clientType: 'INDIVIDUAL',
      firstName: row[0],
      lastName: row[1],
      email: row[2] || '',
      phone: row[3] || '',
      utr: row[4]?.toString(),
      vatNumber: row[5]?.toString() && row[5].toString().length === 11 ? `GB${row[5].toString()}` : undefined, // Sole trader VAT
      addressLine1: row[6] || '',
      city: row[7] || '',
      postcode: row[8] || '',
      departments: {
        corporationTax: false,
        paye: false,
        vat: !!row[5], // Has VAT if self-employed trader
        selfAssessment: true // Individuals file SA
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };
  }

  /** Get helper value from client (extended properties) */
  private getSheetValueFromClient(client: HMRCClient, fieldName: string): string | undefined {
    // This would need to be extended with additional fields from the sheet
    // For now, return undefined - implement based on actual sheet structure
    switch (fieldName) {
      case 'udr_number': return undefined;
      case 'date_of_birth': return undefined;
      case 'nino': return undefined;
      default: return undefined;
    }
  }

  /** Generate UUID for IDs */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /** Write call log to local JSONL file */
  private async writeCallLogToFile(log: CallLog): Promise<void> {
    try {
      const fs = await import('fs');
      const path = await import('path');
      
      const logPath = path.join(process.cwd(), 'hmrc-call-logs.jsonl');
      const logLine = JSON.stringify(log) + '\n';
      
      fs.appendFileSync(logPath, logLine);
    } catch (error: any) {
      console.warn('Could not write to call logs file:', error.message);
    }
  }

  /** Read call logs from local JSONL file */
  private async readCallLogsFromFile(): Promise<CallLog[]> {
    try {
      const fs = await import('fs');
      const path = await import('path');
      
      const logPath = path.join(process.cwd(), 'hmrc-call-logs.jsonl');
      
      if (!fs.existsSync(logPath)) {
        return [];
      }
      
      const content = fs.readFileSync(logPath, 'utf8');
      return content
        .split('\n')
        .filter(line => line.trim())
        .map(line => JSON.parse(line));
    } catch (error: any) {
      console.warn('Could not read call logs file:', error.message);
      return [];
    }
  }

  /** Get mock data for development/testing */
  private getMockData(sheetKey: string): any[] {
    if (sheetKey === 'companies') {
      // [A=Reg, B=Name, C=Email, D=Phone, E=VAT, F=UTR, G=PAYE, H=Address, I=City, J=Postcode]
      return [
        ['SC123456', 'Acme Ltd', 'admin@acme.co.uk', '0161 123 4567', '123456789', '1234567890', 'SC123456C', '123 High Street', 'Manchester', 'M1 1AA'],
        ['SC987654', 'Test Charity', 'hello@testcharity.org', '020 7123 4567', '987654321', '0987654321', '', '45 Victoria Road', 'London', 'SW1A 1AA']
      ];
    } else if (sheetKey === 'individuals') {
      // Individuals structure TBD
      return [];
    }
    return [];
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default HMRCDataRepository;

// Export types and constants for use in other modules
export { HMRCClient, SecurityQuestions, CallLog, HMRC_Department, ClientType };
