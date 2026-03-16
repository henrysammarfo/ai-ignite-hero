// Pure TypeScript — no dependencies, works in browser and Deno

export interface Ivms101Payload {
  originator: {
    originatorPersons: [{
      naturalPerson: {
        name: [{
          nameIdentifier: [{
            primaryIdentifier: string   // last name
            secondaryIdentifier: string // first name
            nameIdentifierType: 'LEGL'
          }]
        }]
      }
    }]
    accountNumber: string[]
  }
  beneficiary: {
    beneficiaryPersons: [{
      naturalPerson: {
        name: [{
          nameIdentifier: [{
            primaryIdentifier: string
            secondaryIdentifier: string
            nameIdentifierType: 'LEGL'
          }]
        }]
      }
    }]
    accountNumber: string[]
  }
  originatingVasp: {
    originatingVasp: {
      legalPerson: {
        name: {
          nameIdentifier: [{
            legalPersonName: string
            legalPersonNameIdentifierType: 'LEGL'
          }]
        }
      }
    }
  }
  beneficiaryVasp: {
    beneficiaryVasp: {
      legalPerson: {
        name: {
          nameIdentifier: [{
            legalPersonName: string
            legalPersonNameIdentifierType: 'LEGL'
          }]
        }
      }
    }
  }
  payloadMetadata: {
    transliterationMethod: ['ROMN']
  }
}

export function buildIvms101(params: {
  senderWallet: string
  senderFirstName: string
  senderLastName: string
  receiverWallet: string
  receiverFirstName: string
  receiverLastName: string
  originatingVaspName?: string
  beneficiaryVaspName?: string
}): Ivms101Payload {
  return {
    originator: {
      originatorPersons: [{
        naturalPerson: {
          name: [{
            nameIdentifier: [{
              primaryIdentifier: params.senderLastName,
              secondaryIdentifier: params.senderFirstName,
              nameIdentifierType: 'LEGL'
            }]
          }]
        }
      }],
      accountNumber: [params.senderWallet]
    },
    beneficiary: {
      beneficiaryPersons: [{
        naturalPerson: {
          name: [{
            nameIdentifier: [{
              primaryIdentifier: params.receiverLastName,
              secondaryIdentifier: params.receiverFirstName,
              nameIdentifierType: 'LEGL'
            }]
          }]
        }
      }],
      accountNumber: [params.receiverWallet]
    },
    originatingVasp: {
      originatingVasp: {
        legalPerson: {
          name: {
            nameIdentifier: [{
              legalPersonName: params.originatingVaspName || 'ComplianceVault',
              legalPersonNameIdentifierType: 'LEGL'
            }]
          }
        }
      }
    },
    beneficiaryVasp: {
      beneficiaryVasp: {
        legalPerson: {
          name: {
            nameIdentifier: [{
              legalPersonName: params.beneficiaryVaspName || 'ComplianceVault',
              legalPersonNameIdentifierType: 'LEGL'
            }]
          }
        }
      }
    },
    payloadMetadata: {
      transliterationMethod: ['ROMN']
    }
  }
}

export function validateIvms101(payload: Ivms101Payload): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  const orig = payload.originator?.originatorPersons?.[0]?.naturalPerson?.name?.[0]?.nameIdentifier?.[0]
  if (!orig?.primaryIdentifier) errors.push('Originator last name required')
  if (!orig?.secondaryIdentifier) errors.push('Originator first name required')
  
  const bene = payload.beneficiary?.beneficiaryPersons?.[0]?.naturalPerson?.name?.[0]?.nameIdentifier?.[0]
  if (!bene?.primaryIdentifier) errors.push('Beneficiary last name required')
  if (!bene?.secondaryIdentifier) errors.push('Beneficiary first name required')
  
  if (!payload.originator?.accountNumber?.[0]) 
    errors.push('Sender wallet required')
  if (!payload.beneficiary?.accountNumber?.[0]) 
    errors.push('Receiver wallet required')
  
  return { valid: errors.length === 0, errors }
}

export async function hashIvms101(payload: Ivms101Payload): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(JSON.stringify(payload))
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
