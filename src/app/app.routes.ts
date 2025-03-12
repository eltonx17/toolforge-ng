import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Sha256HashComponent } from './components/hash/sha256-hash/sha256-hash.component';
import { JsonFormatterComponent } from './components/json/json-formatter/json-formatter.component';
import { AiChatComponent } from './components/chat/ai-chat/ai-chat.component';

export const routes: Routes = [
    { path: 'sha256hash', component: Sha256HashComponent },
    { path: 'json-formatter', component: JsonFormatterComponent },
    { path: 'ai-chat', component: AiChatComponent },
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes)
    ],
    exports: [RouterModule]  
})
export class AppRoutingModule { }
