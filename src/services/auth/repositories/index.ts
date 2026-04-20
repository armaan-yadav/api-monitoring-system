import type { Model } from 'mongoose';

export interface IBaseRepository<T> {
    create(data: Partial<T>): Promise<T>;
    findById(id: string): Promise<T | null>;
    findByUsername(username: string): Promise<T | null>;
    findByEmail(email: string): Promise<T | null>;
    findAll(): Promise<T[]>;
    update(id: string, data: Partial<T>): Promise<T | null>;
    delete(id: string): Promise<boolean>;
}

export abstract class BaseRepository<T> implements IBaseRepository<T> {
    constructor(protected model: Model<T>) {}
    abstract create(data: Partial<T>): Promise<T>;
    abstract findById(id: string): Promise<T | null>;
    abstract findAll(): Promise<T[]>;
    abstract update(id: string, data: Partial<T>): Promise<T | null>;
    abstract delete(id: string): Promise<boolean>;
    abstract findByUsername(username: string): Promise<T | null>;
    abstract findByEmail(email: string): Promise<T | null>;
}
