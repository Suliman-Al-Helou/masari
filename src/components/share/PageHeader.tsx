export default function PageHeader({title,description}:{title:string,description:string}) {
    return (
        <div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {description}
          </p>
        </div>
        </div>
    )
}