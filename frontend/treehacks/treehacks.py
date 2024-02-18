"""Welcome to Reflex! This file outlines the steps to create a basic app."""

from rxconfig import config

import reflex as rx

docs_url = "https://reflex.dev/docs/getting-started/introduction"
filename = f"{config.app_name}/{config.app_name}.py"


class State(rx.State):
    """The app state."""

    # The image to show.
    img: str

    async def handle_upload(self, file: rx.UploadFile):
        """Handle the upload of a file.

        Args:
            file: The uploaded file.
        """
        upload_data = await file.read()
        outfile = f".web/public/{file.filename}"

        # Save the file.
        with open(outfile, "wb") as file_object:
            file_object.write(upload_data)

        # Update the img var.
        self.img = file.filename

        rx.console_log(self.img)


def index() -> rx.Component:
    return rx.flex(
        rx.heading(
            "Splat",
            size="9",
            margin_top="20px",
        ),
        rx.flex(
            rx.flex(
                rx.box(
                    background="linear-gradient(45deg, var(--tomato-9), var(--plum-9))",
                    width="650px",
                    height="400px",
                    margin="12px",
                ),
                rx.flex(
                    # rx.theme_panel(),
                    rx.upload(
                        rx.text("Drag and drop files here or click to select files"),
                        border="1px dotted rgb(107,99,246)",
                        padding="5em",
                        # on_click=lambda: State.handle_upload(rx.upload_files()),
                    ),
                    rx.flex(
                        rx.button(
                            "Start capture.",
                            on_click=lambda: rx.console_log("clicked start"),
                            size="4",
                        ),
                        rx.button(
                            "End capture.",
                            on_click=lambda: rx.console_log("clicked end"),
                            size="4",
                        ),
                        align="center",
                        spacing="7",
                        font_size="2em",
                        justify="center",
                        margin_top="10px",
                    ),
                    justify="center",
                    direction="column",
                    margin_top="30px",
                    margin_left="30px",
                ),
                align="center",
                direction="row",
            ),
            direction="column",
            align="center",
            justify="center",
            height="80vh",
            width="80vw",
        ),
        align="center",
        direction="column",
    )


app = rx.App(state=State)
app.add_page(index, title="Upload")
app.compile()
