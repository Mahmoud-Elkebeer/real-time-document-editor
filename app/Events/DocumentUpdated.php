<?php

namespace App\Events;

use App\Models\Document;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;

class DocumentUpdated implements ShouldBroadcast
{
    use SerializesModels;

    public $document;
    public $user;

    public function __construct(Document $document, $user)
    {
        $this->document = $document;
        $this->user = $user;
    }

    public function broadcastOn()
    {
        return new PresenceChannel('document.' . $this->document->id);
    }

    public function broadcastWith()
    {
        return [
            'document' => $this->document,
        ];
    }
}
