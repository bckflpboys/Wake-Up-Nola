/**
 * Wake Up Nola - Vault & Shared Folder Context
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { vaultService, LocalSharedFolder } from '../services/vaultService';
import { VaultDocument } from '../db/schema';

interface VaultContextType {
    documents: VaultDocument[];
    folders: LocalSharedFolder[];
    isLoading: boolean;
    searchQuery: string;
    searchResults: VaultDocument[];
    setSearchQuery: (query: string) => void;
    addDocument: (title: string, filename: string, content: string, tags?: string, fileType?: string) => Promise<VaultDocument>;
    deleteDocument: (id: string) => Promise<void>;
    importSamplePack: () => Promise<void>;
    refreshVault: () => Promise<void>;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export const VaultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [documents, setDocuments] = useState<VaultDocument[]>([]);
    const [folders, setFolders] = useState<LocalSharedFolder[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searchResults, setSearchResults] = useState<VaultDocument[]>([]);

    useEffect(() => {
        refreshVault();
    }, []);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults(documents);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = documents.filter(doc =>
                doc.title.toLowerCase().includes(query) ||
                doc.content.toLowerCase().includes(query) ||
                (doc.tags || '').toLowerCase().includes(query) ||
                doc.filename.toLowerCase().includes(query)
            );
            setSearchResults(filtered);
        }
    }, [searchQuery, documents]);

    const refreshVault = async () => {
        setIsLoading(true);
        try {
            const docs = await vaultService.getAllDocuments();
            const folderList = await vaultService.getSharedFolders();
            setDocuments(docs);
            setFolders(folderList);
            setSearchResults(docs);
        } catch (err) {
            console.error('Failed to load vault documents:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const addDocument = async (
        title: string,
        filename: string,
        content: string,
        tags: string = '',
        fileType: string = 'markdown'
    ): Promise<VaultDocument> => {
        const newDoc = await vaultService.addDocument(title, filename, content, tags, fileType);
        await refreshVault();
        return newDoc;
    };

    const deleteDocument = async (id: string): Promise<void> => {
        await vaultService.deleteDocument(id);
        await refreshVault();
    };

    const importSamplePack = async (): Promise<void> => {
        await vaultService.importSamplePack();
        await refreshVault();
    };

    return (
        <VaultContext.Provider
            value={{
                documents,
                folders,
                isLoading,
                searchQuery,
                searchResults,
                setSearchQuery,
                addDocument,
                deleteDocument,
                importSamplePack,
                refreshVault,
            }}
        >
            {children}
        </VaultContext.Provider>
    );
};

export const useVault = () => {
    const context = useContext(VaultContext);
    if (!context) {
        throw new Error('useVault must be used within a VaultProvider');
    }
    return context;
};

export default VaultContext;
