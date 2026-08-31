import { PharmaEntity } from '../types/pharmayemen';

export interface GoogleUserProfile {
  email: string;
  name: string;
  avatarUrl: string;
  facilityName: string;
  facilityType: 'pharmacy' | 'hospital' | 'distributor' | 'clinic' | 'wholesaler';
  governorate: string;
  city: string;
  address: string;
  phone: string;
  licenseNumber: string;
}

export const DEFAULT_GOOGLE_USER: GoogleUserProfile = {
  email: 'qpjiu.sea@gmail.com',
  name: 'د. قاسم الشرجبي (صيدلي معتمد)',
  avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
  facilityName: 'صيدلية النور والأمل الحديثة',
  facilityType: 'pharmacy',
  governorate: 'صنعاء',
  city: 'صنعاء',
  address: 'شارع حدة - جوار برج الرويشان',
  phone: '+967 777 889 900',
  licenseNumber: 'YE-SANAA-2026-MOH89',
};

export const GOOGLE_PRESET_ENTITIES: GoogleUserProfile[] = [
  {
    email: 'qpjiu.sea@gmail.com',
    name: 'د. قاسم الشرجبي (صيدلية النور)',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    facilityName: 'صيدلية النور والأمل الحديثة',
    facilityType: 'pharmacy',
    governorate: 'صنعاء',
    city: 'صنعاء',
    address: 'شارع حدة - جوار برج الرويشان',
    phone: '+967 777 889 900',
    licenseNumber: 'YE-SANAA-2026-MOH89',
  },
  {
    email: 'aden.pharma.dist@gmail.com',
    name: 'مستودع الشفاء للتوزيع الدوائي',
    avatarUrl: 'https://images.unsplash.com/photo-1586015555751-63c25b7964b3?w=150&auto=format&fit=crop&q=80',
    facilityName: 'مستودع الشفاء والخليج للأدوية',
    facilityType: 'distributor',
    governorate: 'عدن',
    city: 'عدن',
    address: 'المنصورة - شارع التسعين الرئيسي',
    phone: '+967 733 445 566',
    licenseNumber: 'YE-ADEN-2026-DST44',
  },
  {
    email: 'taiz.hope.hospital@gmail.com',
    name: 'مستشفى الأمل والرحمة العام',
    avatarUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=150&auto=format&fit=crop&q=80',
    facilityName: 'مستشفى الأمل التخصصي العام',
    facilityType: 'hospital',
    governorate: 'تعز',
    city: 'تعز',
    address: 'شارع جمال - جولة المسبح',
    phone: '+967 711 223 344',
    licenseNumber: 'YE-TAIZ-2026-HSP12',
  },
];

const GOOGLE_AUTOFILL_PROMPTED_KEY = 'pharmayemen_google_autofill_prompted_v1';

export function hasSeenGoogleAutofillPrompt(): boolean {
  try {
    return localStorage.getItem(GOOGLE_AUTOFILL_PROMPTED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function markGoogleAutofillPromptAsSeen(): void {
  try {
    localStorage.setItem(GOOGLE_AUTOFILL_PROMPTED_KEY, 'true');
  } catch {
    // ignore
  }
}

export function buildEntityFromGoogleProfile(profile: GoogleUserProfile = DEFAULT_GOOGLE_USER): PharmaEntity {
  return {
    id: `ent-google-${Date.now()}`,
    name: profile.facilityName,
    type: profile.facilityType,
    licenseNumber: profile.licenseNumber,
    governorate: profile.governorate,
    city: profile.city,
    address: profile.address,
    phone: profile.phone,
    status: 'verified',
    subscriptionPlan: 'pro',
    createdAt: new Date().toISOString(),
  };
}
