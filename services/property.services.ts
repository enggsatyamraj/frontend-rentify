import { BASE_URL } from "@/utils/const";
import { CreatePropertyFormData, UpdatePropertyFormData, PropertyFilters } from "@/utils/validations/property.validation";

// Interface for property response
export interface PropertyResponse {
    success: boolean;
    message: string;
    data?: any;
    pagination?: {
        total: number;
        page: number;
        pages: number;
    };
}

interface ImageUpload {
    uri: string;
    type: string;
    name: string;
}

export const propertyService = {
    async createProperty(data: CreatePropertyFormData, images: { uri: string, type: string, name: string }[], token: string): Promise<PropertyResponse> {
        try {
            const formData = new FormData();

            // Add property data under 'body' key
            formData.append('body', JSON.stringify({
                title: data.title,
                description: data.description,
                propertyType: data.propertyType,
                price: data.price,
                location: data.location,
                details: data.details,
                amenities: data.amenities,
                preferredTenants: data.preferredTenants,
                availableFrom: data.availableFrom,
                rules: data.rules,
                foodAvailable: data.foodAvailable,
                maintainenceCharges: data.maintainenceCharges
            }));

            // Append images with proper React Native FormData structure
            images.forEach((image, index) => {
                const fileExt = image.uri.split('.').pop();
                formData.append('images', {
                    uri: image.uri,
                    type: `image/${fileExt}` || 'image/jpeg',
                    name: `image-${index}.${fileExt}`,
                } as any);
            });

            console.log('Final FormData:', formData);

            const response = await fetch(`${BASE_URL}/property`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/json",
                    "Content-Type": "multipart/form-data",
                },
                body: formData
            });

            const result = await response.json();
            console.log('Response from server:', result);

            if (!response.ok) {
                const error = result.message || 'Failed to create property';
                throw new Error(error);
            }
            return result;
        } catch (error) {
            console.error('Service error:', error);
            throw error;
        }
    },

    async getProperties(filters?: PropertyFilters): Promise<PropertyResponse> {
        const queryParams = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryParams.append(key, value.toString());
                }
            });
        }

        const response = await fetch(`${BASE_URL}/property?${queryParams.toString()}`);
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        return result;
    },

    async getPropertyById(id: string): Promise<PropertyResponse> {
        const response = await fetch(`${BASE_URL}/property/${id}`);
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        return result;
    },

    async updateProperty(id: string, data: UpdatePropertyFormData, images: File[], token: string): Promise<PropertyResponse> {
        const formData = new FormData();

        // Append property data
        formData.append('data', JSON.stringify(data));

        // Append new images if any
        images.forEach((image) => {
            formData.append('images', image);
        });

        const response = await fetch(`${BASE_URL}/property/${id}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        return result;
    },

    async deleteProperty(id: string, token: string): Promise<PropertyResponse> {
        const response = await fetch(`${BASE_URL}/property/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        return result;
    },

    async toggleFavorite(id: string, token: string): Promise<PropertyResponse> {
        const response = await fetch(`${BASE_URL}/property/${id}/favorite`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        return result;
    },

    async getUserProperties(token: string): Promise<PropertyResponse> {
        const response = await fetch(`${BASE_URL}/property/user`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        return result;
    },

    async getFavoriteProperties(token: string): Promise<PropertyResponse> {
        const response = await fetch(`${BASE_URL}/property/favorites`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        return result;
    }
};