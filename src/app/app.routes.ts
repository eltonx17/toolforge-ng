import { Routes } from '@angular/router';
import { HashGeneratorComponent } from './components/hash-generator/hash-generator.component';
import { FormatterComponent } from './components/formatter/formatter.component';
import { AiChatComponent } from './components/chat/ai-chat/ai-chat.component';
import { HomeComponent } from './components/home/home.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'hash-generator', component: HashGeneratorComponent },
    { path: 'formatter', component: FormatterComponent },
    { path: 'ai-chat', component: AiChatComponent },
];