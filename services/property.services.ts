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

export const propertyService = {
    async createProperty(data: CreatePropertyFormData, images: File[], token: string): Promise<PropertyResponse> {
        const formData = new FormData();

        // Append property data
        formData.append('data', JSON.stringify(data));

        // Append images
        images.forEach((image) => {
            formData.append('images', image);
        });

        const response = await fetch(`${BASE_URL}/property`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        return result;
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