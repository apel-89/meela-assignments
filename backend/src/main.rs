use std::env;

use log::info;
use poem::{
    EndpointExt, Route, Server,
    error::ResponseError,
    get, handler, post,
    http::StatusCode,
    listener::TcpListener,
    web::{Data, Json, Path},
};
use serde::Serialize;
use serde::Deserialize;
use sqlx::PgPool;
use uuid::Uuid;

#[derive(Debug, thiserror::Error)]
enum Error {
    #[error(transparent)]
    Io(#[from] std::io::Error),
    #[error(transparent)]
    Sqlx(#[from] sqlx::Error),
    #[error(transparent)]
    Var(#[from] std::env::VarError),
    #[error(transparent)]
    Dotenv(#[from] dotenv::Error),
}

impl ResponseError for Error {
    fn status(&self) -> StatusCode {
        match self {
            Error::Sqlx(sqlx::Error::RowNotFound) => StatusCode::NOT_FOUND,
            _ => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }
}

async fn init_pool() -> Result<PgPool, Error> {
    let pool = PgPool::connect(&env::var("DATABASE_URL")?).await?;
    Ok(pool)
}


#[derive(Serialize)]
struct CreateResponse {
    id: Uuid,
}

#[handler]
async fn create_submission(
    Data(pool): Data<&PgPool>,
) -> Result<Json<CreateResponse>, Error> {
    let row = sqlx::query!(
        "insert into submissions default values returning id"
    )
    .fetch_one(pool)
    .await?;

    Ok(Json(CreateResponse { id: row.id }))
}

#[derive(Serialize)]
struct Submission {
    id: Uuid,
    answers: serde_json::Value,
    current_step: i32,
    completed: bool,
}

#[handler]
async fn get_submission(
    Data(pool): Data<&PgPool>,
    Path(id): Path<Uuid>,
) -> Result<Json<Submission>, Error> {
    let row = sqlx::query!(
        "select id, answers, current_step, completed from submissions where id = $1",
        id
    )
    .fetch_one(pool)
    .await?;

    Ok(Json(Submission {
        id: row.id,
        answers: row.answers,
        current_step: row.current_step,
        completed: row.completed,
    }))
}

#[derive(Deserialize)]
struct PatchRequest {
    answers: serde_json::Value,
    current_step: i32,
}

#[handler]
async fn patch_submission(
    Data(pool): Data<&PgPool>,
    Path(id): Path<Uuid>,
    Json(body): Json<PatchRequest>,
) -> Result<Json<Submission>, Error> {
    let row = sqlx::query!(
        "update submissions
         set answers = answers || $2,
             current_step = $3,
             updated_at = now()
         where id = $1
         returning id, answers, current_step, completed",
        id,
        body.answers,
        body.current_step
    )
    .fetch_one(pool)
    .await?;

    Ok(Json(Submission {
        id: row.id,
        answers: row.answers,
        current_step: row.current_step,
        completed: row.completed,
    }))
}

#[derive(Deserialize)]
struct CompleteRequest {
    answers: serde_json::Value,
}

#[handler]
async fn complete_submission(
    Data(pool): Data<&PgPool>,
    Path(id): Path<Uuid>,
    Json(body): Json<CompleteRequest>,
) -> Result<Json<Submission>, Error> {
    let row = sqlx::query!(
        "update submissions
         set answers = $2,
             completed = true,
             updated_at = now()
         where id = $1
         returning id, answers, current_step, completed",
        id,
        body.answers
    )
    .fetch_one(pool)
    .await?;

    Ok(Json(Submission {
        id: row.id,
        answers: row.answers,
        current_step: row.current_step,
        completed: row.completed,
    }))
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    dotenv::dotenv()?;
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    info!("Initialize db pool");
    let pool = init_pool().await?;
    let app = Route::new()
        .at("/api/submissions", post(create_submission))
        .at("/api/submissions/:id", get(get_submission).patch(patch_submission))
        .at("/api/submissions/:id/complete", post(complete_submission))
        .data(pool);
    Server::new(TcpListener::bind("0.0.0.0:3005"))
        .run(app)
        .await?;

    Ok(())
}

