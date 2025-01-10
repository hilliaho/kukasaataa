from invoke import task


@task
def backend(ctx):
    with ctx.cd("src/backend"):
        ctx.run("source venv/bin/activate", pty=True)
        ctx.run("python3 app.py", pty=True)


@task
def frontend(ctx):
    with ctx.cd("src/frontend"):
        ctx.run("npm start", pty=True)
