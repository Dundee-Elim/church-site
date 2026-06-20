export function resolveMediaSrc(asset) {
  return asset?.url || asset?.path || '';
}

export function formatPhoneHref(phoneValue) {
  return String(phoneValue || '').replace(/[^\d+]/g, '');
}

export function isPublishedContentItem(item) {
  return !item?.status || item.status === 'published';
}

export function filterPublishedItems(items) {
  return (items || []).filter(isPublishedContentItem);
}

export function getGlobalSiteInfo(content) {
  const settings = content?.settings || {};
  const legacyContact = settings.contact || {};
  const legacyLinks = settings.links || {};
  const siteInfo = settings.siteInfo || {};
  const social = siteInfo.social || {};
  const giving = siteInfo.giving || {};
  const parking = siteInfo.parking || {};

  return {
    churchName: siteInfo.churchName || settings.siteName || '',
    mobileNumberDisplay: siteInfo.mobileNumberDisplay || legacyContact.phoneDisplay || '',
    mobileNumberHref: siteInfo.mobileNumberHref || legacyContact.phoneHref || legacyContact.phoneDisplay || '',
    contactEmail: siteInfo.contactEmail || legacyContact.email || '',
    safeguardingEmail: siteInfo.safeguardingEmail || legacyContact.email || '',
    addressLine1: siteInfo.addressLine1 || legacyContact.addressLine1 || '',
    addressLine2: siteInfo.addressLine2 || legacyContact.addressLine2 || '',
    addressShort: siteInfo.addressShort || legacyContact.addressShort || '',
    sundayServiceTime: siteInfo.sundayServiceTime || '10:30 AM',
    communionNote: siteInfo.communionNote || '',
    giving: {
      onlineGivingLabel: giving.onlineGivingLabel || 'Give Online',
      onlineGivingUrl: giving.onlineGivingUrl || legacyLinks.onlineGivingUrl || '',
      standingOrderTitle: giving.standingOrderTitle || 'Standing Order',
      bankTransferTitle: giving.bankTransferTitle || 'Bank Transfer',
      bankName: giving.bankName || '',
      accountName: giving.accountName || '',
      sortCode: giving.sortCode || '',
      accountNumber: giving.accountNumber || '',
      iban: giving.iban || '',
      bic: giving.bic || '',
      referenceNote: giving.referenceNote || '',
      qrCodeImage: giving.qrCodeImage || { path: '', url: '', alt: '' },
      qrCodeNote: giving.qrCodeNote || 'QR code coming soon.',
    },
    parking: {
      parkingNote: parking.parkingNote || '',
      bellStreetCarParkName: parking.bellStreetCarParkName || 'Bell Street Car Park',
      bellStreetCarParkMapUrl: parking.bellStreetCarParkMapUrl || '',
      parkingChargesUrl: parking.parkingChargesUrl || '',
    },
    social: {
      youtubeUrl: social.youtubeUrl || legacyLinks.youtubeUrl || '',
      facebookUrl: social.facebookUrl || legacyLinks.facebookUrl || '',
      instagramUrl: social.instagramUrl || '',
    },
  };
}
