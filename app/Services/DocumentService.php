<?php

namespace App\Services;

use App\Events\DocumentUpdated;
use App\Models\Document;
use App\Models\DocumentVersion;
use Illuminate\Support\Facades\DB;

class DocumentService
{
    public function getDocuments($request)
    {
        return Document::all();
    }

    public function getDocument($id)
    {
        return Document::findOrFail($id);
    }

    public function createDocument(array $data): Document
    {
        return Document::create([
            'title' => $data['title'],
            'content' => $data['content'] ?? null,
        ]);

    }

    public function updateDocument(Document $document, array $data): Document
    {
        try {
            DB::beginTransaction();

            if (!is_null($document->content)) {
                DocumentVersion::create([
                    'document_id' => $document->id,
                    'content' => $document->content,
                ]);
            }

            $document->update($data);

            DB::commit();
            broadcast(new DocumentUpdated($document, auth()->user()))->toOthers();
        } catch (\Exception $exception) {
            DB::rollBack();
        }

        return $document;
    }
}
