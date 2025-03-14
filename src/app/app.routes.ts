import { Routes } from '@angular/router';
import { Sha256HashComponent } from './components/hash/sha256-hash/sha256-hash.component';
import { JsonFormatterComponent } from './components/json/json-formatter/json-formatter.component';
import { AiChatComponent } from './components/chat/ai-chat/ai-chat.component';
import { HomeComponent } from './components/home/home/home.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'sha256hash', component: Sha256HashComponent },
    { path: 'json-formatter', component: JsonFormatterComponent },
    { path: 'ai-chat', component: AiChatComponent },
];