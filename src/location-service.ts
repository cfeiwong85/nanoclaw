/**
 * IP-based Geolocation Service for NanoClaw
 * Provides location information based on IP address
 */

export interface LocationData {
  ip: string;
  country: string;
  country_code: string;
  city: string;
  region: string;
  latitude: number;
  longitude: number;
  timezone: string;
  isp?: string;
}

export interface LocationServiceConfig {
  enabled: boolean;
  service: 'ipapi' | 'ip-api' | 'maxmind';
}

class LocationService {
  private config: LocationServiceConfig;

  constructor() {
    this.config = {
      enabled: process.env.ENABLE_LOCATION_ACCESS === 'true',
      service: (process.env.LOCATION_SERVICE || 'ipapi') as
        | 'ipapi'
        | 'ip-api'
        | 'maxmind',
    };
  }

  async getLocationFromIP(ip?: string): Promise<LocationData | null> {
    if (!this.config.enabled) {
      console.log('Location access is disabled');
      return null;
    }

    try {
      switch (this.config.service) {
        case 'ipapi':
          return await this.getLocationFromIPAPI(ip);
        case 'ip-api':
          return await this.getLocationFromIPAPI_COM(ip);
        default:
          console.warn(`Unknown location service: ${this.config.service}`);
          return null;
      }
    } catch (error) {
      console.error('Failed to get location:', error);
      return null;
    }
  }

  private async getLocationFromIPAPI(
    ip?: string,
  ): Promise<LocationData | null> {
    const url = ip ? `https://ipapi.co/${ip}/json/` : 'https://ipapi.co/json/';
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = (await response.json()) as Record<string, unknown>;

    return {
      ip: data.ip as string,
      country: data.country_name as string,
      country_code: data.country_code as string,
      city: data.city as string,
      region: data.region as string,
      latitude: data.latitude as number,
      longitude: data.longitude as number,
      timezone: data.timezone as string,
      isp: data.org as string,
    };
  }

  private async getLocationFromIPAPI_COM(
    ip?: string,
  ): Promise<LocationData | null> {
    const url = ip ? `http://ip-api.com/json/${ip}` : 'http://ip-api.com/json/';
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = (await response.json()) as Record<string, unknown>;

    if (data.status !== 'success') {
      throw new Error(`API error: ${data.message}`);
    }

    return {
      ip: data.query as string,
      country: data.country as string,
      country_code: data.countryCode as string,
      city: data.city as string,
      region: data.region as string,
      latitude: data.lat as number,
      longitude: data.lon as number,
      timezone: data.timezone as string,
      isp: data.isp as string,
    };
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }

  getService(): string {
    return this.config.service;
  }
}

export const locationService = new LocationService();
