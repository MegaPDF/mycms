<?php

namespace Plugins\SampleTestPlugin\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class SampleMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Add plugin header to response
        $response = $next($request);

        $response->headers->set('X-Sample-Plugin', 'Active');
        $response->headers->set('X-Sample-Plugin-Version', '1.0.0');

        return $response;
    }
}