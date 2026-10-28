import {Router } from 'express';
import crypto from 'node:crypto';
import { pool} from '../db.js';
import { PRIORITIES, priorityFor, STATUSES } from './validation';
import { validateLead, priorityFor,STATUSES, PRIORITIES} from  '../validation.js';
