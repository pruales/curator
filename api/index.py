from fastapi import FastAPI, Query
from fastapi.responses import StreamingResponse
import os

from typing import List

from pydantic import BaseModel

from langchain_nvidia_ai_endpoints import ChatNVIDIA
from langchain_openai import ChatOpenAI

from dotenv import load_dotenv
load_dotenv(".env.local")

from supabase import create_client, Client

from exa_py import Exa

from datetime import datetime
import pytz

app = FastAPI()
class ChatRequest(BaseModel):
    messages: List[dict]

def get_chat_model(model="meta/llama-3.3-70b-instruct", api_key=None):
    if model == "meta/llama-3.3-70b-instruct":
        # return ChatNVIDIA(model=model)
        return ChatNVIDIA(
          model=model,
          api_key=api_key,
          temperature=0.2,
          top_p=0.7,
          max_tokens=1024,
          metadata={
                "ls_provider": "nvidia",
                "ls_model_name": model,
                "model_name": model,
            }
        )
    if model == 'gpt-4o':
        return ChatOpenAI(
            model=model,
            max_tokens=4096,
            temperature=0.3,
            streaming=True,
            metadata={
                "ls_provider": "openai",
                "ls_model_name": model,
                "model_name": model,
            }
        )
    if model == 'gpt-4o-mini':
        return ChatOpenAI(
            model=model,
            max_tokens=4096,
            temperature=0.3,
            streaming=True,
            metadata={
                "ls_provider": "openai",
                "ls_model_name": model,
                "model_name": model,
            }
        )

@app.get("/api/hello")
def read_root():
    return {"message": "Hello, World!"}

@app.post("/api/chat")
async def handle_chat_data(request: ChatRequest, protocol: str = Query('data')):
    try:
        model = 'meta/llama-3.3-70b-instruct'
        # api_key = os.getenv('NVIDIA_API_KEY')
        llm = get_chat_model(model=model, api_key=api_key)
    except:
        model = 'gpt-4o'
        api_key = os.getenv('OPENAI_API_KEY') 
        llm = get_chat_model(model=model, api_key=api_key) 
    
    # Format messages properly for the LLM
    messages = [{"role": msg["role"], "content": msg["content"]} for msg in request.messages]
    
    async def generate():
        count = 0
        try:
            async for chunk in llm.astream(messages):
                if chunk.content:
                    yield chunk.content
                count += 1
        except Exception as e:
            if count == 0:
                try:
                    model = 'gpt-4o'
                    api_key = os.getenv('OPENAI_API_KEY') 
                    llm = get_chat_model(model=model, api_key=api_key) 
                    async for chunk in llm.astream(messages):
                        if chunk.content:
                            yield chunk.content 
                except Exception as e:
                   print(f"Streaming error: {e}")
                   yield f"Error: {str(e)}" 
            # print(f"Streaming error: {e}")
            # yield f"Error: {str(e)}"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            'x-vercel-ai-data-stream': 'v1',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        }
    )

@app.post("/api/feed")
async def handle_feed_generation(feed_id: str, start_date: str):
    # Input: feed_id --> feed id to search supabase table
    # Input: start_date --> start date to search the web using exa api
    # Output: None --> no response since we are uploading to supabase table
    url: str = os.environ.get("SUPABASE_URL")
    key: str = os.environ.get("SUPABASE_API_KEY")
    supabase: Client = create_client(url, key)
    feed_data = supabase.table("feeds").select("*").eq("id", feed_id).execute()

    exa = Exa(api_key=os.environ.get("EXA_API_KEY"))

    result = exa.search(
        # "I'm a founder in the AI space and I want to stay on the cutting edge of AI advancements and product releases. Make sure that I only see insightful and useful things. ",
        feed_data.data[0]['prompt'],
        type="auto",
        num_results=10,
        start_published_date=start_date
    )
    
    # Get current UTC time
    utc_now = datetime.now(pytz.UTC)

    # Upload to supabase table
    upload_data = []
    for record in result.results:
        upload_data.append({
            "created_at": utc_now.strftime('%Y-%m-%d %H:%M:%S.%f+00'),
            "url": record.url,
            "published_at": record.published_date,
            "feed_id": feed_id,
            "user_id": feed_data.data[0]['user_id'],
        })

    response = (
        supabase.table("entries")
        .insert(upload_data)
        .execute()
    )


    print(response)
    return {"message": response}