from invoke import task

@task
def backend(ctx):
    with ctx.cd("src/backend"):
        ctx.run("poetry install", pty=True)
        ctx.run("poetry run python3 app.py", pty=True)

@task
def frontend(ctx):
    with ctx.cd("src/frontend"):
        ctx.run("npm start", pty=True)

@task
def fetcher(ctx):
    with ctx.cd("src/fetcher"):
        ctx.run("poetry install", pty=True)
        ctx.run("poetry run python3 main.py", pty=True)

