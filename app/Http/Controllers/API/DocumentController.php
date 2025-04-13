<?php

namespace App\Http\Controllers\API;

use Exception;
use App\Models\Document;
use Illuminate\Http\Request;
use App\Services\DocumentService;
use App\Http\Controllers\Controller;
use App\Http\Requests\DocumentUpdateRequest;
use App\Http\Requests\DocumentCreateRequest;

class DocumentController extends Controller
{
    public function __construct(public DocumentService $documentService){}

    public function index(Request $request)
    {
        try {
            $documents = $this->documentService->getDocuments($request);

            return response()->json(['data' => $documents]);

        } catch (Exception $exception) {
            return response()->json(['error' => $exception->getMessage()], 500);
        }
    }

    public function store(DocumentCreateRequest $request)
    {
        try {
            $document = $this->documentService->createDocument($request->validated());

            return response()->json($document);

        } catch (Exception $exception) {
            return response()->json(['error' => $exception->getMessage()], 500);
        }
    }

    public function show(Document $document)
    {
        return response()->json($document);
    }

    public function update(DocumentUpdateRequest $request, Document $document)
    {
        try {
            $document = $this->documentService->updateDocument($document, $request->validated());

            return response()->json($document);

        } catch (Exception $exception) {
            return response()->json(['error' => $exception->getMessage()], 500);
        }
    }

    public function versions(Document $document)
    {
        $versions = $document->versions()->latest()->get();

        return response()->json($versions);
    }
}
